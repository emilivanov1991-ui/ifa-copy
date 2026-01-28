import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { plan_id } = payload;

    if (!plan_id) {
      return Response.json({ error: 'plan_id is required' }, { status: 400 });
    }

    // Извличане на плана
    const plan = await base44.asServiceRole.entities.FinancialPlan.get(plan_id);
    if (!plan) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Извличане на анализа
    const analysis = await base44.asServiceRole.entities.FinancialAnalysisSubmission.get(plan.analysis_id);
    if (!analysis) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Извличане на правилата
    const rulesData = await base44.asServiceRole.entities.FinancialPlanRules.filter({ is_active: true });
    const rules = rulesData.length > 0 ? rulesData[0] : null;

    // Създаване на контекст за AI агента
    const context = `
Моля, анализирай следния финансов план и предложи оптимизации:

**ИНФОРМАЦИЯ ЗА КЛИЕНТА:**
- Име: ${analysis.client_first_name} ${analysis.client_last_name}
- Възраст: ${analysis.client_age} години
- Семейно положение: ${analysis.client_marital_status}
- Брой деца: ${analysis.children_count || 0}
- Нетен месечен доход: ${analysis.client_net_income} BGN
${analysis.include_partner ? `- Партньор нетен доход: ${analysis.partner_net_income} BGN` : ''}

**ФИНАНСОВИ ПОКАЗАТЕЛИ:**
- Общ месечен доход: ${plan.total_monthly_income.toFixed(2)} EUR
- Общи месечни разходи: ${plan.total_monthly_expenses.toFixed(2)} EUR
- Месечна премия по плана: ${plan.total_monthly_premium.toFixed(2)} EUR
- Наличност за инвестиции: ${plan.available_for_investment.toFixed(2)} EUR

**НУЖДИ ОТ ЗАЩИТА:**
- Защита партньор 1: ${plan.protection_need_p1.toFixed(0)} EUR
${plan.protection_need_p2 ? `- Защита партньор 2: ${plan.protection_need_p2.toFixed(0)} EUR` : ''}
- Резервна нужда: ${plan.reserve_need.toFixed(0)} EUR

**ПРИОРИТЕТИ:**
${analysis.priority_income_protection ? `- Защита на дохода: приоритет ${analysis.priority_income_protection}` : ''}
${analysis.priority_property_protection ? `- Защита на имущество: приоритет ${analysis.priority_property_protection}` : ''}
${analysis.priority_reserve ? `- Резерви: приоритет ${analysis.priority_reserve}` : ''}
${analysis.priority_housing ? `- Жилище: приоритет ${analysis.priority_housing}` : ''}
${analysis.priority_pension ? `- Пенсия: приоритет ${analysis.priority_pension}` : ''}
${analysis.priority_children ? `- Деца: приоритет ${analysis.priority_children}` : ''}

**ПРЕПОРЪЧАНИ ПРОДУКТИ:**
${JSON.stringify(plan.products, null, 2)}

**РИСКОВЕ:**
${analysis.risk_layoff ? '- Риск от съкращение' : ''}
${analysis.risk_maternity ? '- Риск от отпуск по майчинство' : ''}
${analysis.risk_sick_leave ? '- Риск от болнични' : ''}
${analysis.risk_disability ? '- Риск от инвалидност' : ''}
${analysis.risk_death ? '- Риск от смърт' : ''}

Моля, направи пълен анализ и предложи конкретни подобрения.
`;

    // Извикване на AI агента (използвайки InvokeLLM интеграция)
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: context,
      response_json_schema: {
        type: "object",
        properties: {
          overall_rating: {
            type: "number",
            description: "Обща оценка на плана от 1 до 10"
          },
          summary: {
            type: "string",
            description: "Кратко резюме на анализа"
          },
          strengths: {
            type: "array",
            items: { type: "string" },
            description: "Силни страни на плана"
          },
          weaknesses: {
            type: "array",
            items: { type: "string" },
            description: "Слаби страни и проблеми"
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                recommendation: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                expected_impact: { type: "string" }
              }
            },
            description: "Конкретни препоръки за подобрение"
          },
          compliance_check: {
            type: "object",
            properties: {
              follows_rules: { type: "boolean" },
              violations: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Актуализиране на плана с AI препоръките
    const updatedNotes = JSON.parse(plan.notes || '{}');
    updatedNotes.ai_analysis = {
      timestamp: new Date().toISOString(),
      analysis: aiResponse,
      version: '1.0'
    };

    await base44.asServiceRole.entities.FinancialPlan.update(plan_id, {
      notes: JSON.stringify(updatedNotes)
    });

    return Response.json({
      success: true,
      ai_analysis: aiResponse,
      message: 'AI анализът е завършен и записан в плана'
    });

  } catch (error) {
    console.error('Error in AI optimization:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});