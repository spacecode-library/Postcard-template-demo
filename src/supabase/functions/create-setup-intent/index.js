import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  try {
    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email } = await req.json();

    // Check if customer exists
    let { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId;

    if (!customer) {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      // Save to database
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomer.id,
          email: email || user.email,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      stripeCustomerId = stripeCustomer.id;
      customer = newCustomer;
    } else {
      stripeCustomerId = customer.stripe_customer_id;
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        user_id: user.id,
      },
    });

    // Save setup intent to database
    const { error: setupIntentError } = await supabase
      .from('setup_intents')
      .insert({
        customer_id: customer.id,
        stripe_setup_intent_id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status,
      });

    if (setupIntentError) {
      console.error('Failed to save setup intent:', setupIntentError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        customerId: stripeCustomerId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});