import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Evrotrust Webhook Handler
 * Receives signing session status updates from Evrotrust.
 * 
 * This endpoint is called WITHOUT user auth — it's a webhook.
 * Must validate the webhook signature to ensure it's from Evrotrust.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate webhook signature (Evrotrust sends X-Evrotrust-Signature header)
    const signature = req.headers.get('X-Evrotrust-Signature');
    const webhookSecret = Deno.env.get('EVROTRUST_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('EVROTRUST_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify signature (implementation depends on Evrotrust's signature scheme)
    // Typically: HMAC-SHA256 of request body with secret
    const body = await req.text();
    const crypto = new Crypto();
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const bodyBuffer = new TextEncoder().encode(body);
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      bodyBuffer
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const {
      session_id,
      status, // 'completed', 'declined', 'expired', 'error'
      signed_document_url,
      declined_reason,
      metadata, // Contains journey_id, application_id from session creation
    } = payload;

    if (!session_id || !status) {
      return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const journey_id = metadata?.journey_id;
    const application_id = metadata?.application_id;

    // Find the SigningEvent record
    const signingEvents = await base44.entities.SigningEvent.filter({
      signing_session_id: session_id,
    });

    if (signingEvents.length === 0) {
      console.error('SigningEvent not found for session:', session_id);
      return Response.json({ error: 'Signing session not found' }, { status: 404 });
    }

    const signingEvent = signingEvents[0];

    // Update SigningEvent with webhook data
    const updateData: any = {
      status: status === 'completed' ? 'signed_successful' : 
              status === 'declined' ? 'declined' :
              status === 'expired' ? 'expired' : 'error',
      finished_at: new Date().toISOString(),
      webhook_received_at: new Date().toISOString(),
      message: declined_reason || status,
    };

    if (signed_document_url) {
      // Store signed document reference (upload to private storage if needed)
      updateData.document_refs = [signed_document_url];
    }

    await base44.entities.SigningEvent.update(signingEvent.id, updateData);

    // Update journey state based on signing result
    if (journey_id) {
      if (status === 'completed') {
        // Transition to payment_in_progress
        try {
          await base44.functions.invoke('journeyStateMachine', {
            journey_id,
            new_state: 'payment_in_progress',
            metadata: {
              signing_completed_at: new Date().toISOString(),
            },
          });
        } catch (e) {
          console.error('Failed to update journey state after signing:', e);
        }
      } else if (status === 'declined' || status === 'expired') {
        // Transition to signing_failed
        try {
          await base44.functions.invoke('journeyStateMachine', {
            journey_id,
            new_state: 'signing_failed',
            metadata: {
              signing_failed_reason: declined_reason || status,
            },
          });
        } catch (e) {
          console.error('Failed to update journey state after signing failure:', e);
        }
      }
    }

    return Response.json({
      success: true,
      journey_id,
      application_id,
      signing_status: status,
    });

  } catch (error) {
    console.error('Evrotrust webhook error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});