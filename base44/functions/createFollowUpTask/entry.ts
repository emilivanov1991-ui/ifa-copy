import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Create FollowUp Task
 * Automatically creates a FollowUpTask when a journey requires manual intervention.
 * 
 * Called by entity automation when journey enters graceful_stop or other blocked states.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is called by automation — payload contains entity event data
    const payload = await req.json();
    const { event, data, old_data } = payload;

    if (!data || !data.id) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Handle ProviderSubmission permanent_failure (different entity trigger)
    if (event?.entity_name === 'ProviderSubmission' || data?.idempotency_key !== undefined) {
      const submission = data;
      const journey_id = submission.journey_id;

      const task = await base44.asServiceRole.entities.FollowUpTask.create({
        journey_id: journey_id || null,
        client_id: submission.client_id || null,
        client_name: 'Unknown',
        client_email: '',
        reason: 'provider_submission_failed',
        reason_detail: `Provider submission permanently failed after ${submission.attempt_number || 0} attempts. Provider: ${submission.provider_name || submission.provider_id || 'Unknown'}. Error: ${submission.error_message || 'Unknown error'}`,
        priority: 'urgent',
        assigned_queue: 'technical',
        status: 'open',
        notes: `Auto-created from ProviderSubmission permanent_failure\nSubmission ID: ${submission.id}\nIdempotency Key: ${submission.idempotency_key}`,
      });

      console.log(`Created FollowUpTask ${task.id} for ProviderSubmission ${submission.id}`);
      return Response.json({ success: true, task_id: task.id, reason: 'provider_submission_failed' });
    }

    const journey = data;
    const journey_id = journey.id;

    // Get client data
    let client;
    if (journey.client_id) {
      const clients = await base44.asServiceRole.entities.Client.filter({ id: journey.client_id });
      if (clients.length > 0) {
        client = clients[0];
      }
    }

    // Determine reason and priority based on journey state
    let reason = 'other';
    let reason_detail = journey.graceful_stop_reason || 'Manual review required';
    let priority = 'medium';
    let assigned_queue = 'general';

    switch (journey.journey_state) {
      case 'graceful_stop':
        reason = 'user_rejected_plan';
        reason_detail = journey.graceful_stop_reason || 'User rejected the plan or stopped the process';
        priority = 'medium';
        assigned_queue = 'sales';
        break;
      case 'discovery_blocked':
        reason = 'discovery_blocked';
        reason_detail = 'User got stuck during discovery phase';
        priority = 'high';
        assigned_queue = 'sales';
        break;
      case 'plan_auto_sell_blocked':
        reason = 'plan_auto_sell_blocked';
        reason_detail = 'Plan does not meet auto-sell criteria — manual review needed';
        priority = 'high';
        assigned_queue = 'compliance';
        break;
      case 'signing_failed':
        reason = 'signing_declined';
        reason_detail = 'Signing process failed or was declined';
        priority = 'high';
        assigned_queue = 'sales';
        break;
      case 'payment_failed':
        reason = 'payment_failed';
        reason_detail = 'Payment processing failed';
        priority = 'medium';
        assigned_queue = 'technical';
        break;
      case 'provider_submission_failed':
        reason = 'provider_submission_failed';
        reason_detail = 'Failed to submit application to provider';
        priority = 'urgent';
        assigned_queue = 'technical';
        break;
      case 'health_non_automatable':
        reason = 'health_non_automatable';
        reason_detail = 'Health questionnaire requires manual underwriting';
        priority = 'high';
        assigned_queue = 'compliance';
        break;
      default:
        reason = 'manual_review_required';
        reason_detail = journey.notes || 'Requires manual review';
    }

    // Fallback: get client_email from FinancialAnalysisSubmission for anonymous journeys
    let clientEmail = client?.email || journey.client_email || '';
    let clientName = client ? `${client.first_name} ${client.last_name}` : '';
    if (!clientEmail && journey.analysis_id) {
      const analyses = await base44.asServiceRole.entities.FinancialAnalysisSubmission.filter({ id: journey.analysis_id });
      if (analyses.length) {
        clientEmail = analyses[0].client_email || '';
        clientName = clientName || `${analyses[0].client_first_name || ''} ${analyses[0].client_last_name || ''}`.trim();
      }
    }

    // Create FollowUpTask
    const task = await base44.asServiceRole.entities.FollowUpTask.create({
      journey_id,
      client_id: client?.id || null,
      client_name: clientName || 'Unknown',
      client_email: clientEmail,
      client_phone: client?.phone || '',
      reason,
      reason_detail,
      priority,
      assigned_queue,
      status: 'open',
      notes: `Auto-created from journey state: ${journey.journey_state}\n\nJourney ID: ${journey_id}\nLanguage: ${journey.language_code || 'bg'}`,
    });

    console.log(`Created FollowUpTask ${task.id} for journey ${journey_id}`);

    return Response.json({
      success: true,
      task_id: task.id,
      journey_id,
      reason,
      priority,
    });

  } catch (error) {
    console.error('Create FollowUp Task error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});