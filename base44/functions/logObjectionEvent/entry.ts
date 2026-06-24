import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * logObjectionEvent
 * Called by the presentation_advisor AI agent to log objections during plan presentation.
 * Stores ObjectionEvent and optionally updates Journey notes for compliance.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accept both authenticated and service-role calls (agent calls are authenticated as app user)
    const body = await req.json();
    const {
      journey_id,
      plan_id,
      objection_text,
      category,
      response_used,
      outcome = 'pending',
      presentation_section,
      language_code = 'bg',
      notes,
    } = body;

    if (!journey_id || !category) {
      return Response.json({ error: 'journey_id and category are required' }, { status: 400 });
    }

    const validCategories = ['price', 'trust', 'timing', 'product_fit', 'competitor', 'need_more_time', 'family_decision', 'off_scope', 'other'];
    const validOutcomes = ['resolved', 'escalated', 'graceful_stop', 'pending'];

    if (!validCategories.includes(category)) {
      return Response.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    const event = await base44.asServiceRole.entities.ObjectionEvent.create({
      journey_id,
      plan_id: plan_id || null,
      session_timestamp: new Date().toISOString(),
      objection_text: objection_text || '',
      category,
      response_used: response_used || '',
      outcome: validOutcomes.includes(outcome) ? outcome : 'pending',
      presentation_section: presentation_section || null,
      language_code,
      notes: notes || null,
    });

    console.log(`Logged ObjectionEvent ${event.id} for journey ${journey_id} — category: ${category}`);

    // If outcome is graceful_stop or off_scope, also update Journey notes for audit trail
    if (outcome === 'graceful_stop' || category === 'off_scope') {
      try {
        await base44.asServiceRole.entities.Journey.update(journey_id, {
          notes: `ObjectionEvent logged: ${category} → ${outcome}. ${objection_text || ''}`.substring(0, 500),
          last_activity_at: new Date().toISOString(),
        });
      } catch { /* non-critical */ }
    }

    return Response.json({
      success: true,
      event_id: event.id,
      journey_id,
      category,
      outcome,
    });

  } catch (error) {
    console.error('logObjectionEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});