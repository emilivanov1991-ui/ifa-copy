import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * generatePlanExplanation
 * 
 * Generates a structured PLAN_EXPLANATION_JSON for the AI presentation agent.
 * Called after generateFinancialPlan succeeds.
 * Saves result to PlanExplanation entity.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Called non-blocking from PlanLoadingScreen (anonymous user) — use service role only
    const { plan_id, language_code = 'bg' } = await req.json();
    if (!plan_id) return Response.json({ error: 'plan_id е задължително' }, { status: 400 });

    // Load plan
    const plans = await base44.asServiceRole.entities.FinancialPlan.filter({ id: plan_id });
    if (!plans.length) return Response.json({ error: 'Планът не е намерен' }, { status: 404 });
    const plan = plans[0];

    // Load analysis
    const analyses = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: plan.analysis_id });
    const a = analyses[0] || {};

    const isBG = language_code === 'bg';
    const clientName = `${a.client_first_name || ''} ${a.client_last_name || ''}`.trim() || (isBG ? 'Клиент' : 'Client');
    const totalPremium = plan.total_monthly_premium || 0;
    const products = plan.products || [];

    // Build per-product summary for the prompt
    const productSummaries = products
      .filter(p => (p.monthly_premium || 0) > 0)
      .map(p => `- ${p.product_name} (${p.provider}): ${p.monthly_premium} EUR/мес, покритие ${p.coverage_amount || 0} EUR, за ${p.beneficiary_name || p.beneficiary}`)
      .join('\n');

    const prompt = isBG
      ? `Ти си финансов съветник от IFA (Integrity Financial Advisors). Генерирай структурирано обяснение на финансов план за клиента ${clientName}.

Данни за плана:
- Обща месечна вноска: ${totalPremium.toFixed(2)} EUR
- Продукти:
${productSummaries}
- Месечен доход: ${(a.client_net_income || 0) + (a.partner_net_income || 0)} EUR
- Желана пенсионна възраст: ${a.client_retirement_age || 65} г.
- Деца: ${a.children_count || 0}
- Включен партньор: ${a.include_partner ? 'Да' : 'Не'}

Генерирай JSON с тези полета:
{
  "overviewNarrative": "2-3 изречения обобщение на плана — защо е подходящ за клиента",
  "keyNumberHighlights": [{"label": "...", "value": "...", "icon": "shield|trending-up|piggy-bank|target"}],
  "perProductExplanations": [{"product_name": "...", "why_recommended": "...", "key_benefit": "...", "monthly_cost_context": "..."}],
  "warningsAndExclusions": ["...", "..."],
  "ctaWording": "Готови ли сте да защитите финансовото бъдеще на семейството си?",
  "objectionAnchors": [{"objection": "Скъпо е", "response": "..."}, {"objection": "Ще помисля", "response": "..."}]
}`
      : `You are a financial advisor from IFA (Integrity Financial Advisors). Generate a structured explanation of a financial plan for client ${clientName}.

Plan data:
- Total monthly premium: ${totalPremium.toFixed(2)} EUR
- Products:
${productSummaries}
- Monthly income: ${(a.client_net_income || 0) + (a.partner_net_income || 0)} EUR
- Desired retirement age: ${a.client_retirement_age || 65}
- Children: ${a.children_count || 0}
- Partner included: ${a.include_partner ? 'Yes' : 'No'}

Generate JSON with these fields:
{
  "overviewNarrative": "2-3 sentence summary of why this plan fits the client",
  "keyNumberHighlights": [{"label": "...", "value": "...", "icon": "shield|trending-up|piggy-bank|target"}],
  "perProductExplanations": [{"product_name": "...", "why_recommended": "...", "key_benefit": "...", "monthly_cost_context": "..."}],
  "warningsAndExclusions": ["...", "..."],
  "ctaWording": "Are you ready to secure your family's financial future?",
  "objectionAnchors": [{"objection": "Too expensive", "response": "..."}, {"objection": "Need to think", "response": "..."}]
}`;

    const explanationJson = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          overviewNarrative: { type: 'string' },
          keyNumberHighlights: { type: 'array', items: { type: 'object' } },
          perProductExplanations: { type: 'array', items: { type: 'object' } },
          warningsAndExclusions: { type: 'array', items: { type: 'string' } },
          ctaWording: { type: 'string' },
          objectionAnchors: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    // Check if PlanExplanation already exists for this plan
    const existing = await base44.asServiceRole.entities.PlanExplanation.filter({ plan_id });

    let saved;
    if (existing.length > 0) {
      saved = await base44.asServiceRole.entities.PlanExplanation.update(existing[0].id, {
        language_code,
        explanation_json: explanationJson,
        generated_at: new Date().toISOString(),
      });
    } else {
      saved = await base44.asServiceRole.entities.PlanExplanation.create({
        plan_id,
        journey_id: plan.journey_id || null,
        analysis_id: plan.analysis_id || null,
        language_code,
        explanation_json: explanationJson,
        generated_at: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      explanation_id: saved.id,
      plan_id,
      explanation: explanationJson,
    });

  } catch (error) {
    console.error('generatePlanExplanation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});