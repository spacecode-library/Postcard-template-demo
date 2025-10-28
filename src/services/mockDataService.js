/**
 * Mock Data Service - LocalStorage based data persistence
 * Mimics Supabase API structure for frontend development
 * All data is stored in localStorage with JSON serialization
 */

const STORAGE_KEYS = {
  CAMPAIGNS: 'movepost_campaigns',
  PAYMENT_METHODS: 'movepost_payment_methods',
  USER_PROFILE: 'movepost_user_profile',
  CAMPAIGN_STATS: 'movepost_campaign_stats',
  ANALYTICS_DATA: 'movepost_analytics_data'
};

// Helper functions for localStorage
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Initialize mock data if not exists
const initializeMockData = () => {
  // Initialize campaigns if empty
  if (!getFromStorage(STORAGE_KEYS.CAMPAIGNS)) {
    const mockCampaigns = [
      {
        id: 'camp_001',
        campaign_name: 'Supreme Spring Collection Launch',
        status: 'active',
        template_id: 'template_1',
        template_name: 'Modern Poster',
        postcard_preview_url: '/template-previews/poster-template-preview.png',
        targeting_type: 'zip_codes',
        target_zip_codes: ['10001', '10002', '10003'],
        validated_zips: [
          { zipCode: '10001', hasData: true, dataCount: 156 },
          { zipCode: '10002', hasData: true, dataCount: 203 },
          { zipCode: '10003', hasData: true, dataCount: 189 }
        ],
        zips_with_data: 3,
        postcards_sent: 548,
        total_recipients: 548,
        price_per_postcard: 3.00,
        total_cost: 1644.00,
        payment_status: 'paid',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        launched_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        approval_status: 'approved',
        approval_history: [
          {
            status: 'pending_review',
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'approved',
            timestamp: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: 'admin@movepost.co'
          }
        ]
      },
      {
        id: 'camp_002',
        campaign_name: 'Holiday Special Promotion',
        status: 'pending_review',
        template_id: 'template_2',
        template_name: 'Modern Postcard',
        postcard_preview_url: '/template-previews/cesdk-2025-09-25T13_14_05.762Z.png',
        targeting_type: 'zip_codes',
        target_zip_codes: ['90210', '90211'],
        validated_zips: [
          { zipCode: '90210', hasData: true, dataCount: 245 },
          { zipCode: '90211', hasData: true, dataCount: 198 }
        ],
        zips_with_data: 2,
        postcards_sent: 0,
        total_recipients: 443,
        price_per_postcard: 3.00,
        total_cost: 1329.00,
        payment_status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        launched_at: null,
        approval_status: 'pending_review',
        approval_history: [
          {
            status: 'pending_review',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'camp_003',
        campaign_name: 'New Store Opening Announcement',
        status: 'draft',
        template_id: 'template_3',
        template_name: 'Professional Business',
        postcard_preview_url: '/template-previews/cesdk-2025-09-25T13_15_08.985Z.png',
        targeting_type: 'zip_codes',
        target_zip_codes: ['33101', '33102', '33109'],
        validated_zips: [
          { zipCode: '33101', hasData: true, dataCount: 312 },
          { zipCode: '33102', hasData: true, dataCount: 278 },
          { zipCode: '33109', hasData: true, dataCount: 165 }
        ],
        zips_with_data: 3,
        postcards_sent: 0,
        total_recipients: 755,
        price_per_postcard: 3.00,
        total_cost: 2265.00,
        payment_status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        launched_at: null,
        approval_status: 'draft',
        approval_history: []
      }
    ];
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, mockCampaigns);
  }

  // Initialize payment methods if empty
  if (!getFromStorage(STORAGE_KEYS.PAYMENT_METHODS)) {
    const mockPaymentMethods = [
      {
        id: 'pm_001',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2026,
        is_default: true,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, mockPaymentMethods);
  }

  // Initialize user profile if empty
  if (!getFromStorage(STORAGE_KEYS.USER_PROFILE)) {
    const mockProfile = {
      id: 'user_001',
      email: 'business@supreme.com',
      full_name: 'Supreme Store',
      company_name: 'Supreme',
      onboarding_completed: true,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    };
    saveToStorage(STORAGE_KEYS.USER_PROFILE, mockProfile);
  }

  // Initialize analytics data if empty
  if (!getFromStorage(STORAGE_KEYS.ANALYTICS_DATA)) {
    const mockAnalytics = generateMockAnalytics();
    saveToStorage(STORAGE_KEYS.ANALYTICS_DATA, mockAnalytics);
  }
};

// Generate mock analytics data for charts
const generateMockAnalytics = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const data = months.map((month, index) => {
    if (index > currentMonth) return null;
    return {
      month,
      postcards_sent: Math.floor(Math.random() * 500) + 100,
      campaigns: Math.floor(Math.random() * 5) + 1
    };
  }).filter(Boolean);

  return data;
};

// Campaign Service
export const mockCampaignService = {
  // Get all campaigns
  getCampaigns: async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    return {
      success: true,
      campaigns: campaigns
    };
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    return { success: true, campaign };
  },

  // Create new campaign
  createCampaign: async (campaignData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];

    const newCampaign = {
      id: `camp_${Date.now()}`,
      ...campaignData,
      created_at: new Date().toISOString(),
      approval_history: [
        {
          status: campaignData.status || 'draft',
          timestamp: new Date().toISOString()
        }
      ]
    };

    campaigns.push(newCampaign);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);

    // Update stats
    mockCampaignService.recalculateStats();

    return { success: true, campaign: newCampaign };
  },

  // Update campaign
  updateCampaign: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    const index = campaigns.findIndex(c => c.id === id);

    if (index === -1) {
      return { success: false, error: 'Campaign not found' };
    }

    campaigns[index] = {
      ...campaigns[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Add to approval history if status changed
    if (updates.status && updates.status !== campaigns[index].status) {
      if (!campaigns[index].approval_history) {
        campaigns[index].approval_history = [];
      }
      campaigns[index].approval_history.push({
        status: updates.status,
        timestamp: new Date().toISOString(),
        reason: updates.rejection_reason || null
      });
    }

    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    mockCampaignService.recalculateStats();

    return { success: true, campaign: campaigns[index] };
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    campaigns = campaigns.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    mockCampaignService.recalculateStats();

    return { success: true };
  },

  // Duplicate campaign
  duplicateCampaign: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    const originalCampaign = campaigns.find(c => c.id === id);

    if (!originalCampaign) {
      return { success: false, error: 'Campaign not found' };
    }

    const duplicatedCampaign = {
      ...originalCampaign,
      id: `camp_${Date.now()}`,
      campaign_name: `${originalCampaign.campaign_name} (Copy)`,
      status: 'draft',
      postcards_sent: 0,
      created_at: new Date().toISOString(),
      launched_at: null,
      approval_status: 'draft',
      approval_history: []
    };

    campaigns.push(duplicatedCampaign);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
    mockCampaignService.recalculateStats();

    return { success: true, campaign: duplicatedCampaign };
  },

  // Get campaign statistics
  getCampaignStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];

    const stats = {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.status === 'active').length,
      pending_campaigns: campaigns.filter(c => c.status === 'pending_review').length,
      draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
      total_postcards_sent: campaigns.reduce((sum, c) => sum + (c.postcards_sent || 0), 0),
      total_spent: campaigns.reduce((sum, c) => sum + ((c.postcards_sent || 0) * c.price_per_postcard), 0)
    };

    saveToStorage(STORAGE_KEYS.CAMPAIGN_STATS, stats);
    return { success: true, stats };
  },

  // Recalculate stats (helper)
  recalculateStats: () => {
    const campaigns = getFromStorage(STORAGE_KEYS.CAMPAIGNS) || [];
    const stats = {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.status === 'active').length,
      pending_campaigns: campaigns.filter(c => c.status === 'pending_review').length,
      draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
      total_postcards_sent: campaigns.reduce((sum, c) => sum + (c.postcards_sent || 0), 0),
      total_spent: campaigns.reduce((sum, c) => sum + ((c.postcards_sent || 0) * c.price_per_postcard), 0)
    };
    saveToStorage(STORAGE_KEYS.CAMPAIGN_STATS, stats);
  },

  // Get analytics data for charts
  getAnalyticsData: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const analyticsData = getFromStorage(STORAGE_KEYS.ANALYTICS_DATA) || [];
    return { success: true, data: analyticsData };
  }
};

// Payment Methods Service
export const mockPaymentService = {
  // Get all payment methods
  getPaymentMethods: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const methods = getFromStorage(STORAGE_KEYS.PAYMENT_METHODS) || [];
    return { success: true, payment_methods: methods };
  },

  // Add new payment method
  addPaymentMethod: async (methodData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const methods = getFromStorage(STORAGE_KEYS.PAYMENT_METHODS) || [];

    const newMethod = {
      id: `pm_${Date.now()}`,
      ...methodData,
      created_at: new Date().toISOString()
    };

    // If this is the first method or marked as default, set it as default
    if (methods.length === 0 || newMethod.is_default) {
      methods.forEach(m => m.is_default = false);
      newMethod.is_default = true;
    }

    methods.push(newMethod);
    saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, methods);

    return { success: true, payment_method: newMethod };
  },

  // Remove payment method
  removePaymentMethod: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let methods = getFromStorage(STORAGE_KEYS.PAYMENT_METHODS) || [];
    const wasDefault = methods.find(m => m.id === id)?.is_default;

    methods = methods.filter(m => m.id !== id);

    // If we removed the default and there are other methods, make the first one default
    if (wasDefault && methods.length > 0) {
      methods[0].is_default = true;
    }

    saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, methods);
    return { success: true };
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const methods = getFromStorage(STORAGE_KEYS.PAYMENT_METHODS) || [];

    methods.forEach(m => {
      m.is_default = m.id === id;
    });

    saveToStorage(STORAGE_KEYS.PAYMENT_METHODS, methods);
    return { success: true };
  }
};

// Initialize on import
initializeMockData();

export default {
  campaigns: mockCampaignService,
  payments: mockPaymentService,
  initializeMockData
};
