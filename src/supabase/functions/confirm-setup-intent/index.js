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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { setupIntentId } = await req.json();

    // Retrieve setup intent from Stripe
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Setup intent not succeeded' }),
        { status: 400 }
      );
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
      });
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(
      setupIntent.payment_method
    );

    // Set as default payment method
    await stripe.customers.update(customer.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Unset previous default
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('customer_id', customer.id)
      .eq('is_default', true);

    // Save payment method to database
    const { data: savedPaymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .upsert({
        customer_id: customer.id,
        stripe_payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        is_default: true,
        billing_details: paymentMethod.billing_details,
      })
      .select()
      .single();

    if (pmError) {
      throw pmError;
    }

    // Update setup intent status
    await supabase
      .from('setup_intents')
      .update({
        status: setupIntent.status,
        payment_method_id: savedPaymentMethod.id,
      })
      .eq('stripe_setup_intent_id', setupIntentId);

    // Update onboarding progress
    await supabase
      .from('onboarding_progress')
      .update({
        payment_completed: true,
        completed_steps: supabase.rpc('array_append', {
          arr: 'completed_steps',
          elem: 5,
        }),
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
        },
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