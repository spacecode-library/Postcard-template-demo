// API Types and Interfaces for Postcard Frontend

// Authentication Types
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface RegisterResponse {
  token: string
  user: User
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  message: string
}

export interface GoogleAuthRequest {
  idToken: string
}

export interface GoogleAuthResponse {
  token: string
  user: User
  message: string
}

// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  companyId?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

// Company Types
export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  size?: string
  description?: string
  logo?: string
}

export interface CompanySetupRequest {
  name: string
  website?: string
  industry?: string
  size?: string
  description?: string
}

export interface CompanyEnrichRequest {
  website: string
}

// Campaign Types
export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed' | 'paused'
  recipientCount: number
  sentCount: number
  budget: number
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignRequest {
  name: string
  templateId: string
  recipientListId: string
  budget: number
  scheduledDate?: string
}

// Template Types
export interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  price: number
  description?: string
}

export interface TemplateCustomization {
  primaryColor?: string
  secondaryColor?: string
  logo?: string
  content: {
    headline?: string
    body?: string
    cta?: string
  }
}

// Analytics Types
export interface DashboardStats {
  totalCampaigns: number
  totalRecipients: number
  totalSent: number
  conversionRate: number
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'campaign_created' | 'campaign_sent' | 'campaign_completed'
  campaignName: string
  timestamp: string
  details: string
}

// Error Response
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password'
  },
  
  // Company endpoints
  COMPANY: {
    SETUP: '/company/setup',
    ENRICH: '/company/enrich',
    UPDATE: '/company/update',
    GET: '/company'
  },
  
  // Campaign endpoints
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    SEND: (id: string) => `/campaigns/${id}/send`,
    PAUSE: (id: string) => `/campaigns/${id}/pause`,
    RESUME: (id: string) => `/campaigns/${id}/resume`
  },
  
  // Template endpoints
  TEMPLATES: {
    LIST: '/templates',
    GET: (id: string) => `/templates/${id}`,
    CATEGORIES: '/templates/categories',
    CUSTOMIZE: (id: string) => `/templates/${id}/customize`
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    CAMPAIGN: (id: string) => `/analytics/campaigns/${id}`,
    EXPORT: '/analytics/export'
  },
  
  // Billing endpoints
  BILLING: {
    SUBSCRIPTION: '/billing/subscription',
    INVOICES: '/billing/invoices',
    PAYMENT_METHODS: '/billing/payment-methods',
    ADD_PAYMENT_METHOD: '/billing/payment-methods',
    UPDATE_SUBSCRIPTION: '/billing/subscription/update'
  }
}