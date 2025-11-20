import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
console.log('[create-setup-intent] Stripe key configured:', !!stripeSecretKey)

if (!stripeSecretKey) {
  console.error('[create-setup-intent] CRITICAL: STRIPE_SECRET_KEY is not set!')
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('[create-setup-intent] Request received')

  try {
    // Get the JWT token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[create-setup-intent] Missing Authorization header')
      throw new Error('Unauthorized: Missing authorization header')
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('[create-setup-intent] Auth error:', authError)
      throw new Error('Unauthorized: Invalid token')
    }

    console.log('[create-setup-intent] Authenticated user:', user.id)

    // Parse request body
    const { email } = await req.json()

    if (!email) {
      console.error('[create-setup-intent] Missing email in request')
      throw new Error('Email is required')
    }

    console.log('[create-setup-intent] Email:', email)

    // Check if customer already exists in Supabase
    const { data: existingCustomer, error: customerQueryError } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = existingCustomer?.stripe_customer_id

    if (!stripeCustomerId) {
      console.log('[create-setup-intent] No existing customer in DB, creating new Stripe customer')

      // Create or retrieve customer from Stripe
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      })

      let stripeCustomer
      if (existingCustomers.data.length > 0) {
        console.log('[create-setup-intent] Found existing Stripe customer')
        stripeCustomer = existingCustomers.data[0]
      } else {
        console.log('[create-setup-intent] Creating new Stripe customer')
        stripeCustomer = await stripe.customers.create({
          email: email,
          metadata: {
            source: 'postcard_app',
            user_id: user.id
          }
        })
      }

      stripeCustomerId = stripeCustomer.id

      // Save customer to Supabase
      console.log('[create-setup-intent] Saving customer to Supabase')
      const { error: insertError } = await supabase
        .from('customers')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          email: email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (insertError) {
        console.error('[create-setup-intent] Error saving customer:', insertError)
        throw insertError
      }
      console.log('[create-setup-intent] Customer saved successfully')
    } else {
      console.log('[create-setup-intent] Using existing Stripe customer:', stripeCustomerId)
    }

    // Create setup intent for saving payment method
    console.log('[create-setup-intent] Creating SetupIntent')
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        customer_email: email,
        user_id: user.id
      }
    })

    console.log('[create-setup-intent] SetupIntent created:', setupIntent.id)

    return new Response(
      JSON.stringify({
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
        customerId: stripeCustomerId,
        status: setupIntent.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('[create-setup-intent] Error:', error)
    console.error('[create-setup-intent] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message?.includes('Unauthorized') ? 401 : 500,
      },
    )
  }
})
