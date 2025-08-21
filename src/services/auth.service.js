import api from './api'

const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async googleLogin(idToken) {
    const response = await api.post('/auth/google', { idToken })
    return response.data
  },

  async verify() {
    const response = await api.get('/auth/verify')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put('/user/profile', profileData)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/user/profile')
    return response.data
  },

  async setupCompany(companyData) {
    const response = await api.post('/company/setup', companyData)
    return response.data
  },

  async enrichCompany(website) {
    const response = await api.post('/company/enrich', { website })
    return response.data
  },
}

export default authService