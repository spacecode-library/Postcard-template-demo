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

    const { data: response, error: error } = await supabase.functions.invoke('smart-action', {
      body: { setupIntentId: setupIntentId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    return await response;
  },

  async getPaymentMethods() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      // Try to get customer from customers table
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // If customers table doesn't exist or customer not found, return empty array
      if (customerError || !customer) {
        console.log('No customer found or customers table does not exist');
        return [];
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customer.id)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      return [];
    }
  },

  async updateOnboardingProgress(step, data) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

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
      throw error;
    }
  },

  /**
   * Add a payment method using Stripe SetupIntent
   * @param {Object} setupIntent - Stripe SetupIntent object
   * @returns {Promise<Object>} Created payment method
   */
  async addPaymentMethod(setupIntent) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      // Get or create customer
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (customerError || !customer) {
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
        throw error;
      }

      return paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * Set a payment method as default
   * @param {string} paymentMethodId - Payment method ID
   */
  async setDefaultPaymentMethod(paymentMethodId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      // Get customer
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

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
        throw error;
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Remove a payment method
   * @param {string} paymentMethodId - Payment method ID
   */
  async removePaymentMethod(paymentMethodId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      // Get customer
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

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
      console.error('Error removing payment method:', error);
      throw error;
    }
  },
};