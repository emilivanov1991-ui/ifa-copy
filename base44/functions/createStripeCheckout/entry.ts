import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.0.0';

/**
 * Stripe Checkout Session Creator
 * Creates a Stripe checkout session for insurance product payment.
 * 
 * Prerequisites:
 * - STRIPE_SECRET_KEY must be set
 * 
 * Flow:
 * 1. Create Stripe checkout session with product details
 * 2. Return checkout URL for frontend redirect
 * 3. Webhook handler (separate function) receives payment completion
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Note: This app doesn't require login, so user may not be authenticated
    // We'll rely on journey_id/application_id from the payload for tracking

    const body = await req.json();
    const {
      journey_id,
      application_id,
      amount, // in EUR
      product_name,
      product_description,
      success_url,
      cancel_url,
    } = body;

    if (!journey_id || !amount || !success_url || !cancel_url) {
      return Response.json({
        error: 'Missing required fields: journey_id, amount, success_url, cancel_url'
      }, { status: 400 });
    }

    // Check Stripe key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return Response.json({
        error: 'STRIPE_SECRET_KEY not configured'
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product_name || 'Insurance Product',
              description: product_description || 'Insurance premium payment',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url,
      cancel_url,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        journey_id,
        application_id: application_id || '',
      },
      customer_email: body.customer_email || null,
    });

    // Create PaymentEvent entity record
    const paymentEvent = await base44.entities.PaymentEvent.create({
      journey_id,
      application_id,
      provider: 'stripe',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      amount,
      currency: 'EUR',
      status: 'pending',
      initiated_at: new Date().toISOString(),
    });

    // Update journey state to payment_in_progress
    try {
      await base44.functions.invoke('journeyStateMachine', {
        journey_id,
        new_state: 'payment_in_progress',
        metadata: {
          payment_intent_id: session.payment_intent,
        },
      });
    } catch (e) {
      console.error('Failed to update journey state:', e);
    }

    return Response.json({
      checkout_url: session.url,
      session_id: session.id,
      payment_event_id: paymentEvent.id,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({
      error: error.message,
    }, { status: 500 });
  }
});