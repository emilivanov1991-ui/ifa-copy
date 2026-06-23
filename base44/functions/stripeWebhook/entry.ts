import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.0.0';

/**
 * Stripe Webhook Handler
 * Receives payment events from Stripe.
 * 
 * This endpoint is called WITHOUT user auth — it's a webhook.
 * Must validate the webhook signature to ensure it's from Stripe.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get Stripe webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Read raw body
    const body = await req.text();

    // Verify webhook signature
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripe = new Stripe(stripeSecretKey);

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle different event types
    const { type, data } = event;
    const session = data.object;

    console.log(`Processing Stripe webhook: ${type}`, { session_id: session.id });

    // Extract metadata
    const journey_id = session.metadata?.journey_id;
    const application_id = session.metadata?.application_id;

    if (type === 'checkout.session.completed') {
      // Payment successful
      const paymentIntent = session.payment_intent as string;
      
      // Find PaymentEvent record
      const paymentEvents = await base44.entities.PaymentEvent.filter({
        stripe_checkout_session_id: session.id,
      });

      if (paymentEvents.length > 0) {
        const paymentEvent = paymentEvents[0];
        
        // Update payment event status
        await base44.entities.PaymentEvent.update(paymentEvent.id, {
          status: 'succeeded',
          completed_at: new Date().toISOString(),
          webhook_received_at: new Date().toISOString(),
        });

        // Update journey state to provider_submission_in_progress
        if (journey_id) {
          try {
            await base44.functions.invoke('journeyStateMachine', {
              journey_id,
              new_state: 'provider_submission_in_progress',
              metadata: {
                payment_completed_at: new Date().toISOString(),
              },
            });
          } catch (e) {
            console.error('Failed to update journey state after payment:', e);
          }
        }

        // TODO: Trigger provider submission logic here
        // This could be done via a scheduled automation or direct API call
      }
    } else if (type === 'checkout.session.expired' || type === 'payment_intent.payment_failed') {
      // Payment failed or expired
      const paymentEvents = await base44.entities.PaymentEvent.filter({
        stripe_checkout_session_id: session.id,
      });

      if (paymentEvents.length > 0) {
        const paymentEvent = paymentEvents[0];
        
        await base44.entities.PaymentEvent.update(paymentEvent.id, {
          status: 'failed',
          error_message: type === 'checkout.session.expired' ? 'Session expired' : 'Payment failed',
          webhook_received_at: new Date().toISOString(),
        });

        // Update journey state to payment_failed
        if (journey_id) {
          try {
            await base44.functions.invoke('journeyStateMachine', {
              journey_id,
              new_state: 'payment_failed',
              metadata: {
                payment_failed_reason: type === 'checkout.session.expired' ? 'Session expired' : 'Payment failed',
              },
            });
          } catch (e) {
            console.error('Failed to update journey state after payment failure:', e);
          }
        }
      }
    }

    return Response.json({ success: true, received: type });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});