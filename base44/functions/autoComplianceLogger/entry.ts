import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * autoComplianceLogger
 * 
 * Entity automation: fires on Journey UPDATE when journey_state changes.
 * Automatically writes/updates ComplianceAuditRecord for every state transition.
 * Legal requirement — tracks full journey lifecycle.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { data: journey, old_data, changed_fields } = payload;

    if (!journey?.id) {
      return Response.json({ skipped: true, reason: 'No journey data' });
    }

    // Only act when journey_state changed
    if (!changed_fields || !changed_fields.includes('journey_state')) {
      return Response.json({ skipped: true, reason: 'journey_state not changed' });
    }

    const journeyId = journey.id;
    const newState = journey.journey_state;
    const now = new Date().toISOString();

    console.log(`ComplianceLogger: journey ${journeyId} → ${newState}`);

    // Build update payload for audit record
    const auditUpdate = {
      final_journey_state: newState,
      last_activity_at: now,
    };

    // Map states to timestamp fields
    const stateToTimestamp = {
      'discovery_intro_in_progress': 'discovery_started_at',
      'discovery_collecting':        'discovery_started_at',
      'analysis_approved':           'discovery_completed_at',
      'plan_generating':             null,
      'plan_ready':                  'plan_generated_at',
      'plan_auto_sell_blocked':      'plan_generated_at',
      'signing_in_progress':         null,
      'completed':                   null,
    };

    const tsField = stateToTimestamp[newState];
    if (tsField && !journey[tsField]) {
      auditUpdate[tsField] = now;
    }

    // Extra fields by state
    if (newState === 'analysis_approved') {
      auditUpdate.discovery_completed_at = now;
      if (journey.analysis_id) {
        // Fetch consent records
        const consents = await base44.asServiceRole.entities.ConsentRecord.filter({
          journey_id: journeyId,
        });
        if (consents.length > 0) {
          auditUpdate.consent_record_ids = consents.map(c => c.id);
        }
      }
    }

    if (newState === 'signing_in_progress' && journey.plan_id) {
      const signEvents = await base44.asServiceRole.entities.SigningEvent.filter({
        journey_id: journeyId,
      });
      if (signEvents.length > 0) {
        auditUpdate.signing_session_id = signEvents[signEvents.length - 1].signing_session_id;
      }
    }

    if (old_data?.journey_state === 'discovery_resumed_pending_reverification') {
      auditUpdate.is_resumed_session = true;
      auditUpdate.reverification_performed = true;
    }

    // Check for existing audit record
    const existing = await base44.asServiceRole.entities.ComplianceAuditRecord.filter({
      journey_id: journeyId,
    });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.ComplianceAuditRecord.update(existing[0].id, auditUpdate);
      console.log(`Updated ComplianceAuditRecord ${existing[0].id}`);
    } else {
      // Create new — include base fields from journey
      const newRecord = {
        journey_id: journeyId,
        user_id: journey.user_id || '',
        rulebook_version: journey.rulebook_version || '',
        ruleset_hash: journey.ruleset_hash || '',
        discovery_started_at: journey.discovery_started_at || now,
        ...auditUpdate,
      };
      const created = await base44.asServiceRole.entities.ComplianceAuditRecord.create(newRecord);
      console.log(`Created ComplianceAuditRecord ${created.id}`);
    }

    return Response.json({ success: true, journey_id: journeyId, state: newState });

  } catch (error) {
    console.error('autoComplianceLogger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});