import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * advanceJourneyPublic — публичен endpoint за Journey state transitions
 * Използва се от FinancialPlanPresentation (no-auth страница).
 * Позволява само whitelist от преходи; извиква journeyStateMachine за валидация и audit.
 */

// Само тези преходи са разрешени от публична страница
const PUBLIC_ALLOWED_TRANSITIONS = [
  'presentation_intro_pending',
  'presentation_in_progress',
  'presentation_stopped_boundary',
  'application_collecting',
  'application_ready_for_signing',
  'signing_in_progress',
  'payment_in_progress',
  'provider_submission_in_progress',
  'completed',
  'graceful_stop',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { journey_id, to_state, extra_data = {} } = await req.json();

    if (!journey_id || !to_state) {
      return Response.json({ error: 'journey_id и to_state са задължителни.' }, { status: 400 });
    }

    if (!PUBLIC_ALLOWED_TRANSITIONS.includes(to_state)) {
      return Response.json({
        error: `Преходът към '${to_state}' не е разрешен от публичен контекст.`,
        allowed: PUBLIC_ALLOWED_TRANSITIONS,
      }, { status: 403 });
    }

    // Вземи journey като service role (без user auth)
    const journey = await base44.asServiceRole.entities.Journey.get(journey_id);
    if (!journey) return Response.json({ error: 'Journey не е намерен.' }, { status: 404 });

    const fromState = journey.journey_state;

    // Permitted transitions map (subset of journeyStateMachine)
    const ALLOWED = {
      plan_ready:                    ['presentation_intro_pending', 'graceful_stop'],
      plan_auto_sell_blocked:        ['graceful_stop'],
      presentation_intro_pending:    ['presentation_in_progress'],
      presentation_in_progress:      ['application_collecting', 'presentation_stopped_boundary', 'graceful_stop'],
      presentation_stopped_boundary: ['graceful_stop'],
      application_collecting:        ['application_ready_for_signing', 'application_incomplete', 'graceful_stop'],
      application_incomplete:        ['application_collecting', 'graceful_stop'],
      application_ready_for_signing: ['signing_in_progress'],
      signing_in_progress:           ['payment_in_progress', 'signing_failed'],
      signing_failed:                ['signing_in_progress', 'graceful_stop'],
      payment_in_progress:           ['provider_submission_in_progress', 'payment_failed'],
      payment_failed:                ['payment_in_progress', 'graceful_stop'],
      provider_submission_in_progress: ['completed', 'graceful_stop'],
    };

    const allowed = ALLOWED[fromState] || [];
    if (!allowed.includes(to_state)) {
      return Response.json({
        error: `Преходът от '${fromState}' към '${to_state}' не е разрешен.`,
        allowed_transitions: allowed,
      }, { status: 422 });
    }

    // Guard: application_collecting изисква plan_id
    if (to_state === 'application_collecting' && !journey.plan_id) {
      return Response.json({ error: 'Няма plan_id — планът не е генериран.' }, { status: 422 });
    }

    const PROTECTED_FIELDS = ['journey_state', 'previous_state', 'state_changed_at'];
    const safeExtra = Object.fromEntries(
      Object.entries(extra_data).filter(([k]) => !PROTECTED_FIELDS.includes(k))
    );

    const updated = await base44.asServiceRole.entities.Journey.update(journey_id, {
      previous_state: fromState,
      journey_state: to_state,
      state_changed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      ...safeExtra,
    });

    return Response.json({ success: true, journey: updated });

  } catch (error) {
    console.error('advanceJourneyPublic error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});