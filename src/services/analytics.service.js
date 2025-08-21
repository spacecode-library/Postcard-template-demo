import api from './api'

export const analyticsService = {
  async getDashboardAnalytics(period = '30d') {
    const response = await api.get('/analytics/dashboard', { 
      params: { period } 
    })
    return response.data
  },

  async getCampaignAnalytics(campaignId) {
    const response = await api.get(`/campaigns/${campaignId}/analytics`)
    return response.data
  },

  async getConversionTracking(params = {}) {
    const response = await api.get('/analytics/conversions', { params })
    return response.data
  },

  async getROIAnalytics(params = {}) {
    const response = await api.get('/analytics/roi', { params })
    return response.data
  },

  async exportAnalytics(type, params = {}) {
    const response = await api.get(`/analytics/export/${type}`, { 
      params,
      responseType: 'blob' 
    })
    return response.data
  },
}

export default analyticsService