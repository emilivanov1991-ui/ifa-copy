import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Permitted state transitions: { from: [allowed_to, ...] }
const ALLOWED_TRANSITIONS = {
  discovery_not_started:                   ['discovery_intro_in_progress'],
  discovery_intro_in_progress:             ['discovery_collecting', 'graceful_stop'],
  discovery_collecting:                    ['discovery_ready_for_review', 'discovery_blocked', 'discovery_resumed_pending_reverification', 'graceful_stop'],
  discovery_resumed_pending_reverification:['discovery_collecting', 'graceful_stop'],
  discovery_ready_for_review:              ['analysis_approved', 'discovery_collecting', 'graceful_stop'],
  discovery_blocked:                       ['graceful_stop'],
  analysis_approved:                       ['plan_generating'],
  plan_generating:                         ['plan_ready', 'graceful_stop'],
  plan_ready:                              ['presentation_intro_pending', 'plan_auto_sell_blocked'],
  plan_auto_sell_blocked:                  ['graceful_stop'],
  presentation_intro_pending:              ['presentation_in_progress'],
  presentation_in_progress:               ['application_collecting', 'presentation_stopped_boundary', 'graceful_stop'],
  presentation_stopped_boundary:           ['graceful_stop'],
  application_collecting:                  ['application_ready_for_signing', 'application_incomplete', 'graceful_stop'],
  application_incomplete:                  ['application_collecting', 'graceful_stop'],
  application_ready_for_signing:           ['signing_in_progress'],
  signing_in_progress:                     ['payment_in_progress', 'signing_failed'],
  signing_failed:                          ['signing_in_progress', 'graceful_stop'],
  payment_in_progress:                     ['provider_submission_in_progress', 'payment_failed'],
  payment_failed:                          ['payment_in_progress', 'graceful_stop'],
  provider_submission_in_progress:         ['completed', 'graceful_stop'],
  completed:                               [],
  graceful_stop:                           [],
};

// Guards: extra conditions required for certain transitions
const TRANSITION_GUARDS = {
  plan_generating: (journey) => {
    if (!journey.analysis_id) return 'Няма analysis_id — анализът не е завършен.';
    return null;
  },
  presentation_intro_pending: (journey) => {
    if (!journey.plan_id) return 'Няма plan_id — планът не е генериран.';
    return null;
  },
  application_collecting: (journey) => {
    if (!journey.plan_id) return 'Няма plan_id — планът не е одобрен.';
    return null;
  },
  signing_in_progress: (journey) => {
    if (!journey.analysis_id || !journey.plan_id) return 'Липсват analysis_id или plan_id.';
    return null;
  },
  payment_in_progress: (journey) => {
    if (journey.reverification_pending && !journey.reverification_completed) {
      return 'Реверификацията не е завършена.';
    }
    return null;
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { journey_id, to_state, extra_data = {} } = await req.json();
    if (!journey_id || !to_state) {
      return Response.json({ error: 'journey_id и to_state са задължителни.' }, { status: 400 });
    }

    const journey = await base44.asServiceRole.entities.Journey.get(journey_id);
    if (!journey) return Response.json({ error: 'Journey не е намерен.' }, { status: 404 });

    const fromState = journey.journey_state;
    const allowed = ALLOWED_TRANSITIONS[fromState] || [];

    if (!allowed.includes(to_state)) {
      return Response.json({
        error: `Преходът от '${fromState}' към '${to_state}' не е разрешен.`,
        allowed_transitions: allowed
      }, { status: 422 });
    }

    // Run guard if exists
    const guard = TRANSITION_GUARDS[to_state];
    if (guard) {
      const guardError = guard(journey);
      if (guardError) {
        return Response.json({ error: guardError }, { status: 422 });
      }
    }

    // Sanitize extra_data — never allow overriding core state fields
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});