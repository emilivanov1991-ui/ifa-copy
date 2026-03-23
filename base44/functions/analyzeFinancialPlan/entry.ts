import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id } = await req.json();

    if (!plan_id) {
      return Response.json({ error: 'plan_id е задължително' }, { status: 400 });
    }

    // Fetch the financial plan
    const planData = await base44.entities.FinancialPlan.filter({ id: plan_id });
    if (!planData || planData.length === 0) {
      return Response.json({ error: 'Планът не е намерен' }, { status: 404 });
    }
    const plan = planData[0];

    // Fetch the analysis
    const analysisData = await base44.entities.FinancialAnalysisSubmission.filter({ 
      id: plan.analysis_id 
    });
    if (!analysisData || analysisData.length === 0) {
      return Response.json({ error: 'Анализът не е намерен' }, { status: 404 });
    }
    const analysis = analysisData[0];

    // Create a conversation with the financial plan analyzer agent
    const conversation = await base44.agents.createConversation({
      agent_name: 'financial_plan_analyzer',
      metadata: {
        name: `Анализ на план ${plan_id}`,
        plan_id: plan_id,
        analysis_id: plan.analysis_id
      }
    });

    // Prepare the context message for the agent
    const contextMessage = `
Моля, анализирай следния финансов план:

═══════════════════════════════════════
КЛИЕНТ ИНФОРМАЦИЯ:
═══════════════════════════════════════
Име: ${analysis.client_first_name} ${analysis.client_last_name}
Възраст: ${analysis.client_age}
Месечен нетен доход: ${analysis.client_net_income} EUR
${analysis.include_partner ? `Партньор: ${analysis.partner_first_name} ${analysis.partner_last_name} (${analysis.partner_age} г.)
Доход партньор: ${analysis.partner_net_income} EUR` : ''}
Деца: ${analysis.children_count || 0}

═══════════════════════════════════════
ПЛАН ОБОБЩЕНИЕ:
═══════════════════════════════════════
Обща месечна премия: ${plan.total_monthly_premium} EUR
Брой продукти: ${plan.products?.length || 0}
Общо покритие: ${plan.total_coverage} EUR

═══════════════════════════════════════
ПРОДУКТИ:
═══════════════════════════════════════
${plan.products?.map((p, i) => `
${i + 1}. ${p.product_name} (${p.provider})
   Тип: ${p.product_type}
   Месечна премия: ${p.monthly_premium} EUR
   ${p.coverage_amount ? `Покритие: ${p.coverage_amount} EUR` : ''}
   ${p.expected_value ? `Прогнозна стойност: ${p.expected_value} EUR` : ''}
`).join('\n') || 'Няма продукти'}

═══════════════════════════════════════
ДОПЪЛНИТЕЛНА ИНФОРМАЦИЯ:
═══════════════════════════════════════
${plan.notes || ''}

Моля, предоставя задълбочен анализ на този план, включително:
1. Оценка на адекватността на покритията
2. Баланс между застраховки и инвестиции
3. Препоръки за подобрения
4. Рискове и възможности
5. Алтернативни варианти, ако има такива
`;

    // Send the message to the agent
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: contextMessage
    });

    // Wait for agent response
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      const updatedConversation = await base44.agents.getConversation(conversation.id);
      const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];
      
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        // Agent has responded
        return Response.json({
          success: true,
          conversation_id: conversation.id,
          analysis: lastMessage.content,
          plan_id: plan_id
        });
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return Response.json({ 
      error: 'Timeout waiting for agent response',
      conversation_id: conversation.id
    }, { status: 504 });

  } catch (error) {
    console.error('Error analyzing financial plan:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});