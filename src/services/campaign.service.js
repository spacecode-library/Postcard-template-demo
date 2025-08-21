import api from './api'

export const campaignService = {
  async getCampaigns(params = {}) {
    const response = await api.get('/campaigns', { params })
    return response.data
  },

  async getCampaignById(id) {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  async createCampaign(data) {
    const response = await api.post('/campaigns', data)
    return response.data
  },

  async updateCampaign(id, data) {
    const response = await api.put(`/campaigns/${id}`, data)
    return response.data
  },

  async deleteCampaign(id) {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },

  async sendCampaign(id) {
    const response = await api.post(`/campaigns/${id}/send`)
    return response.data
  },

  async getCampaignRecipients(id, params = {}) {
    const response = await api.get(`/campaigns/${id}/recipients`, { params })
    return response.data
  },
}

export default campaignService