import { supabase } from "../integration/client";
import { dollarsToCents } from "../../utils/pricing";

export const paymentService = {
  async createSetupIntent(email) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data: response, error: error } = await supabase.functions.invoke('create-setup-intent', {
      body: { email: email },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
    return response;
  },

  /**
   * Create a payment intent to charge the customer
   * @param {number} amount - Amount in dollars (will be converted to cents)
   * @param {string} description - Description of the charge
   * @param {Object} metadata - Additional metadata (campaign_id, postcard_count, etc.)
   * @returns {Promise<Object>} Payment intent data
   */
  async createPaymentIntent(amount, description, metadata = {}) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Convert dollars to cents for Stripe
    const amountInCents = dollarsToCents(amount);

    if (amountInCents < 50) {
      throw new Error('Amount must be at least $0.50 (Stripe minimum)');
    }

    try {
      const { data: response, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: amountInCents,
          description: description || 'Postcard Campaign',
          metadata: metadata
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return response;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Confirm payment with saved payment method
   * @param {string} paymentIntentId - Payment intent ID from Stripe
   * @param {string} paymentMethodId - Payment method ID (optional if customer has default)
   * @returns {Promise<Object>} Confirmation result
   */
  async confirmPayment(paymentIntentId, paymentMethodId = null) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    try {
      const { data: response, error } = await supabase.functions.invoke('confirm-payment', {
        body: {
          paymentIntentId,
          paymentMethodId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return response;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Charge customer for postcard campaign
   * @param {number} postcardCount - Number of postcards
   * @param {Object} campaignData - Campaign data for metadata
   * @returns {Promise<Object>} Charge result
   */
  async chargeForCampaign(postcardCount, campaignData = {}) {
    const { calculatePostcardCost } = await import('../../utils/pricing');

    const pricing = calculatePostcardCost(postcardCount);

    const description = `Postcard Campaign - ${postcardCount} postcard${postcardCount !== 1 ? 's' : ''}`;

    const metadata = {
      type: 'postcard_campaign',
      postcard_count: postcardCount.toString(),
      campaign_name: campaignData.name || 'Untitled Campaign',
      ...(campaignData.campaign_id && { campaign_id: campaignData.campaign_id.toString() })
    };

    return await this.createPaymentIntent(pricing.total, description, metadata);
  },

  async confirmSetupIntent(setupIntentId) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    try {
      const { data: response, error } = await supabase.functions.invoke('confirm-setup-intent', {
        body: { setupIntentId: setupIntentId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (error) {
        console.error('Error confirming setup intent:', error);
        throw error;
      }

      // Check if the response contains an error
      if (response?.error) {
        throw new Error(response.error);
      }

      // Validate response
      if (!response || !response.success) {
        throw new Error('Invalid response from payment confirmation service');
      }

      return response;
    } catch (error) {
      console.error('Failed to confirm setup intent:', error);
      throw error;
    }
  },

  async getPaymentMethods() {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    const user = session.user;
    console.log('[paymentService] Querying with user ID:', user.id);

    try {
      // Try to get customer from customers table
      // Use maybeSingle() instead of single() to handle case where customer doesn't exist
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle errors (but not "no rows" which is expected if customer doesn't exist)
      if (customerError) {
        console.error('[paymentService] Error querying customers table:', customerError);

        // 406 errors indicate RLS policy issues
        if (customerError.code === 'PGRST116' || customerError.message?.includes('406')) {
          console.error('[paymentService] 406 Error: RLS policies may be blocking access');
          throw new Error('Database access denied. Please contact support.');
        }

        throw customerError;
      }

      // If no customer record exists, return empty array (valid scenario)
      if (!customer) {
        console.log('[paymentService] No customer record found for user');
        return [];
      }

      // Query payment methods for this customer
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('[paymentService] Error fetching payment methods:', error);

        // Handle 406 errors for payment_methods table
        if (error.code === 'PGRST116' || error.message?.includes('406')) {
          console.error('[paymentService] 406 Error: RLS policies may be blocking access to payment_methods table');
          throw new Error('Database access denied. Please contact support.');
        }

        throw error;
      }

      console.log('[paymentService] Found payment methods:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[paymentService] Error in getPaymentMethods:', error);

      // Re-throw authentication and permission errors
      if (error.message?.includes('406') || error.message?.includes('Database access denied')) {
        throw error;
      }

      // For other errors, return empty array to avoid breaking the UI
      return [];
    }
  },

  async updateOnboardingProgress(step, data) {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    const user = session.user;

    const updateData = {
      current_step: step,
      updated_at: new Date().toISOString(),
    };

    if (step === 5) {
      updateData.payment_completed = true;
    }

    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        ...updateData,
      });

    if (error) {
      console.error('[paymentService] Error updating onboarding progress:', error);
      throw error;
    }
  },

  /**
   * Add a payment method using Stripe SetupIntent
   * @param {Object} setupIntent - Stripe SetupIntent object
   * @returns {Promise<Object>} Created payment method
   */
  async addPaymentMethod(setupIntent) {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    const user = session.user;

    try {
      // Get or create customer
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) {
        console.error('[paymentService] Error getting customer:', customerError);
        throw customerError;
      }

      if (!customer) {
        throw new Error('Customer not found. Please complete onboarding first.');
      }

      // Check if this is the first payment method
      const { data: existingMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('customer_id', customer.id);

      const isFirstMethod = !existingMethods || existingMethods.length === 0;

      // Insert payment method into database
      const { data: paymentMethod, error } = await supabase
        .from('payment_methods')
        .insert({
          customer_id: customer.id,
          stripe_payment_method_id: setupIntent.payment_method,
          brand: setupIntent.payment_method_details?.card?.brand || 'unknown',
          last4: setupIntent.payment_method_details?.card?.last4 || '0000',
          exp_month: setupIntent.payment_method_details?.card?.exp_month || 1,
          exp_year: setupIntent.payment_method_details?.card?.exp_year || 2025,
          is_default: isFirstMethod, // First payment method is default
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[paymentService] Error inserting payment method:', error);
        throw error;
      }

      return paymentMethod;
    } catch (error) {
      console.error('[paymentService] Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * Set a payment method as default
   * @param {string} paymentMethodId - Payment method ID
   */
  async setDefaultPaymentMethod(paymentMethodId) {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    const user = session.user;

    try {
      // Get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) {
        console.error('[paymentService] Error getting customer:', customerError);
        throw customerError;
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Remove default flag from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('customer_id', customer.id);

      // Set the selected payment method as default
      const { error } = await supabase
        .from('payment_methods')
        .update({
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentMethodId)
        .eq('customer_id', customer.id);

      if (error) {
        console.error('[paymentService] Error setting default payment method:', error);
        throw error;
      }
    } catch (error) {
      console.error('[paymentService] Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Remove a payment method
   * @param {string} paymentMethodId - Payment method ID
   */
  async removePaymentMethod(paymentMethodId) {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    const user = session.user;

    try {
      // Get customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) {
        console.error('[paymentService] Error getting customer:', customerError);
        throw customerError;
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Delete the payment method
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('customer_id', customer.id);

      if (error) {
        console.error('[paymentService] Error deleting payment method:', error);
        throw error;
      }

      // If this was the default method, set another as default
      const { data: remainingMethods } = await supabase
        .from('payment_methods')
        .select('id, is_default')
        .eq('customer_id', customer.id)
        .limit(1);

      if (remainingMethods && remainingMethods.length > 0 && !remainingMethods[0].is_default) {
        await this.setDefaultPaymentMethod(remainingMethods[0].id);
      }
    } catch (error) {
      console.error('[paymentService] Error removing payment method:', error);
      throw error;
    }
  },

  /**
   * Create a Stripe Customer Portal session
   * @param {string} returnUrl - URL to return to after portal session
   * @returns {Promise<Object>} Portal session URL
   */
  async createCustomerPortalSession(returnUrl) {
    // Use getSession() to ensure we have a valid JWT token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[paymentService] No valid session found:', sessionError);
      throw new Error('Not authenticated');
    }

    try {

      // Call Edge Function to create portal session
      // Note: Edge Function will securely look up customer from database using authenticated user
      const { data: response, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: {
          returnUrl: returnUrl || window.location.href
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Handle 406 errors specifically
        if (error.message?.includes('406') || error.status === 406) {
          console.error('[paymentService] 406 Error creating portal session - RLS policy issue');
          throw new Error('Unable to access billing portal. Database permissions need to be configured. Please run the RLS migration or contact support.');
        }

        throw error;
      }

      // Check if the response contains an error (Edge Function returned error in body)
      if (response?.error) {
        // Check for customer not found errors
        if (response.error.includes('No customer found') || response.error.includes('Customer not found')) {
          console.error('[paymentService] No customer record found for user');
          throw new Error('No billing account found. Please add a payment method first or complete onboarding.');
        }

        throw new Error(response.error);
      }

      // Validate that we got a URL back
      if (!response || !response.url) {
        throw new Error('Invalid response from billing portal service. Please ensure you have added a payment method.');
      }

      return response;
    } catch (error) {
      console.error('[paymentService] Error creating customer portal session:', error);

      // Provide more helpful error messages
      if (error.message?.includes('406')) {
        throw new Error('Database access denied. Please run RLS migration or contact support.');
      }

      if (error.message?.includes('No customer found') || error.message?.includes('Customer not found')) {
        throw new Error('No billing account found. Please add a payment method first.');
      }

      throw error;
    }
  },
};