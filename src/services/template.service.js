import api from './api'

export const templateService = {
  async getTemplates(params = {}) {
    const response = await api.get('/templates', { params })
    return response.data
  },

  async getTemplateById(id) {
    const response = await api.get(`/templates/${id}`)
    return response.data
  },

  async generateTemplate(data) {
    const response = await api.post('/templates/generate', data)
    return response.data
  },

  async updateTemplate(id, data) {
    const response = await api.put(`/templates/${id}`, data)
    return response.data
  },

  async deleteTemplate(id) {
    const response = await api.delete(`/templates/${id}`)
    return response.data
  },
}

export default templateService