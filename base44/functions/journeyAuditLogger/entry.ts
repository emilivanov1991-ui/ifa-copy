import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Triggered by entity automation on Journey update.
 * Creates or updates a ComplianceAuditRecord whenever journey_state changes.
 * Fired only when changed_fields includes 'journey_state'.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    const journeyId = data?.id || event?.entity_id;
    if (!journeyId) {
      return Response.json({ error: 'Missing journey_id in payload' }, { status: 400 });
    }

    // Use payload data directly (entity automation provides it); fall back to fetch only if missing
    let journey = data;
    if (!journey || !journey.journey_state) {
      journey = await base44.asServiceRole.entities.Journey.get(journeyId);
      if (!journey) return Response.json({ error: 'Journey not found' }, { status: 404 });
    }

    const newState = journey.journey_state;
    const prevState = old_data?.journey_state || journey.previous_state || null;

    // Look for existing ComplianceAuditRecord for this journey
    const existing = await base44.asServiceRole.entities.ComplianceAuditRecord.filter(
      { journey_id: journeyId },
      '-created_date',
      1
    );

    const now = new Date().toISOString();

    if (existing.length > 0) {
      // Update the existing audit record
      const record = existing[0];

      const updates = {
        last_activity_at: now,
        final_journey_state: newState,
      };

      // Milestone timestamps
      if (newState === 'discovery_collecting' && !record.discovery_started_at) {
        updates.discovery_started_at = journey.discovery_started_at || now;
      }
      if (newState === 'discovery_ready_for_review' || newState === 'analysis_approved') {
        updates.discovery_completed_at = journey.discovery_completed_at || now;
      }
      if (newState === 'plan_ready') {
        updates.plan_generated_at = journey.plan_generated_at || now;
      }
      if (newState === 'signing_in_progress' && journey.compliance_audit_id) {
        updates.signing_session_id = journey.retell_call_id || null;
      }
      if (newState === 'discovery_resumed_pending_reverification' || journey.reverification_pending) {
        updates.is_resumed_session = true;
      }
      if (journey.reverification_completed) {
        updates.reverification_performed = true;
      }
      if (newState === 'graceful_stop') {
        updates.notes = journey.graceful_stop_reason || 'graceful_stop';
      }

      const updated = await base44.asServiceRole.entities.ComplianceAuditRecord.update(record.id, updates);

      // Link audit record back to journey if not already linked
      if (!journey.compliance_audit_id) {
        try {
          await base44.asServiceRole.entities.Journey.update(journeyId, {
            compliance_audit_id: record.id,
          });
        } catch { /* non-critical backlink */ }
      }

      return Response.json({ success: true, action: 'updated', audit_id: updated.id });

    } else {
      // Create initial ComplianceAuditRecord
      const auditData = {
        journey_id: journeyId,
        user_id: journey.user_id || journey.created_by_id || null,
        rulebook_version: journey.rulebook_version || '1.0',
        ruleset_hash: journey.ruleset_hash || null,
        discovery_started_at: journey.discovery_started_at || now,
        last_activity_at: now,
        final_journey_state: newState,
        is_resumed_session: false,
        reverification_performed: false,
        consent_record_ids: [],
        reverified_sections: [],
        prompt_asset_refs: [],
        response_asset_refs: [],
        secure_log_ids: [],
      };

      const created = await base44.asServiceRole.entities.ComplianceAuditRecord.create(auditData);

      // Link audit record to journey
      try {
        await base44.asServiceRole.entities.Journey.update(journeyId, {
          compliance_audit_id: created.id,
        });
      } catch { /* non-critical backlink */ }

      return Response.json({ success: true, action: 'created', audit_id: created.id });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});