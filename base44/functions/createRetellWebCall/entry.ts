/**
 * createRetellWebCall - Secure backend proxy for Retell Web SDK
 *
 * SECURITY: The Retell API key NEVER reaches the browser.
 * This function creates a short-lived access token and returns it to the frontend.
 *
 * Required secret: RETELL_API_KEY
 * Set it in: Base44 Dashboard → Settings → Environment Variables
 *
 * Retell docs: https://docs.retellai.com/api-references/create-web-call
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { journey_id, plan_id, language_code = 'bg' } = await req.json();

    const retellApiKey = Deno.env.get('RETELL_API_KEY');
    if (!retellApiKey) {
      return Response.json(
        { error: 'Retell API key not configured. Set RETELL_API_KEY in environment variables.' },
        { status: 503 }
      );
    }

    // Load plan data to inject as context into the AI agent
    let planContext = {};
    if (plan_id) {
      const plans = await base44.asServiceRole.entities.FinancialPlan.filter({ id: plan_id });
      if (plans.length > 0) {
        const plan = plans[0];
        const offers = await base44.asServiceRole.entities.ProductOffer.filter({ plan_id: plan_id });
        planContext = {
          total_monthly_premium: plan.total_monthly_premium,
          total_coverage: plan.total_coverage,
          partner1_age: plan.partner1_age,
          partner2_age: plan.partner2_age,
          products: offers.map(o => ({
            name: o.product_name,
            provider: o.provider,
            monthly_premium: o.monthly_premium,
            coverage: o.coverage_amount,
            type: o.product_type,
          })),
        };
      }
    }

    // Load journey for client context
    let clientContext = {};
    if (journey_id) {
      const journeys = await base44.asServiceRole.entities.Journey.filter({ id: journey_id });
      if (journeys.length > 0) {
        const journey = journeys[0];
        clientContext = {
          language_code: journey.language_code || language_code,
          journey_state: journey.journey_state,
        };
      }
    }

    // Build metadata to pass to the AI agent as custom context
    const agentMetadata = {
      journey_id,
      plan_id,
      language: language_code === 'bg' ? 'Bulgarian' : 'English',
      plan_summary: planContext,
      client_info: clientContext,
      base44_api_base: `${req.url.split('/functions/')[0]}`, // For tool calls back to Base44
    };

    // Call Retell API to create a web call
    const retellResponse = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Replace with your actual Retell agent ID from the Retell dashboard
        agent_id: Deno.env.get('RETELL_AGENT_ID') || 'your_agent_id_here',
        metadata: agentMetadata,
        retell_llm_dynamic_variables: {
          client_language: language_code === 'bg' ? 'Bulgarian' : 'English',
          plan_json: JSON.stringify(planContext),
          journey_id: journey_id || 'unknown',
        },
      }),
    });

    if (!retellResponse.ok) {
      const errorBody = await retellResponse.text();
      console.error('Retell API error:', retellResponse.status, errorBody);
      return Response.json(
        { error: `Retell API error: ${retellResponse.status}` },
        { status: 502 }
      );
    }

    const retellData = await retellResponse.json();

    // Update journey with call ID
    if (journey_id && retellData.call_id) {
      await base44.asServiceRole.entities.Journey.update(journey_id, {
        retell_call_id: retellData.call_id,
        last_activity_at: new Date().toISOString(),
      });
    }

    // Return only the access token to the browser (never the API key)
    return Response.json({
      access_token: retellData.access_token,
      call_id: retellData.call_id,
    });

  } catch (error) {
    console.error('createRetellWebCall error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});