import { supabase } from "../integration/client";

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

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      return [];
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('customer_id', customer.id)
      .order('is_default', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
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
};