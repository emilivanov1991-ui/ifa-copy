import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Evrotrust Signing Integration
 * Creates a signing session for client application documents.
 * 
 * Prerequisites:
 * - EVROTRUST_API_KEY secret must be set
 * - EVROTRUST_BASE_URL secret must be set (e.g. https://api.evrotrust.com)
 * 
 * Flow:
 * 1. Upload documents to Evrotrust (handled externally or via separate function)
 * 2. Create signing session with signer identity
 * 3. Return session URL for client to sign
 * 4. Webhook handler (separate function) receives completion status
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      journey_id,
      application_id,
      signer_name,
      signer_egn,
      document_urls, // Array of file URLs to sign
    } = body;

    if (!journey_id || !signer_name || !signer_egn || !document_urls) {
      return Response.json({
        error: 'Missing required fields: journey_id, signer_name, signer_egn, document_urls'
      }, { status: 400 });
    }

    // Check API key
    const apiKey = Deno.env.get('EVROTRUST_API_KEY');
    const baseUrl = Deno.env.get('EVROTRUST_BASE_URL') || 'https://api.evrotrust.com';
    
    if (!apiKey) {
      return Response.json({
        error: 'EVROTRUST_API_KEY not configured'
      }, { status: 500 });
    }

    // Create signing session via Evrotrust API
    // Reference: https://docs.evrotrust.com/api
    const sessionPayload = {
      signer: {
        first_name: signer_name.split(' ')[0],
        last_name: signer_name.split(' ').slice(1).join(' '),
        egn: signer_egn,
      },
      documents: document_urls.map(url => ({
        url: url,
        type: 'pdf',
      })),
      callback_url: `${baseUrl}/webhooks/evrotrust`, // Webhook endpoint
      metadata: {
        journey_id,
        application_id,
        user_id: user.id,
      },
    };

    const response = await fetch(`${baseUrl}/api/v1/signing-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Evrotrust API error: ${response.status} - ${errorData}`);
    }

    const sessionData = await response.json();
    const signing_session_id = sessionData.id || sessionData.session_id;
    const signing_url = sessionData.signing_url || sessionData.url;

    // Create SigningEvent entity record
    const signingEvent = await base44.entities.SigningEvent.create({
      journey_id,
      application_id,
      signing_session_id,
      status: 'pending',
      signer_identity: signer_egn,
      started_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    // Update journey state to signing_in_progress
    try {
      await base44.functions.invoke('journeyStateMachine', {
        journey_id,
        new_state: 'signing_in_progress',
        metadata: {
          signing_session_id,
        },
      });
    } catch (e) {
      console.error('Failed to update journey state:', e);
    }

    return Response.json({
      signing_session_id,
      signing_url,
      signing_event_id: signingEvent.id,
      valid_until: signingEvent.valid_until,
    });

  } catch (error) {
    console.error('Evrotrust signing error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});