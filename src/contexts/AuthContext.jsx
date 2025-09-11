import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/auth.service'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Mock user for development without backend
          const mockUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (mockUser.email) {
            setUser(mockUser)
          }
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      // Mock login for development without backend
      const mockUser = {
        id: '1',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        onboardingCompleted: false
      }
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Login successful!')
      
      return { data: { user: mockUser, token: mockToken } }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      // Mock register for development without backend
      const mockUser = {
        id: '1',
        email: userData.email,
        firstName: userData.name || 'Test',
        lastName: 'User',
        onboardingCompleted: false
      }
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Registration successful!')
      
      return { data: { user: mockUser, token: mockToken } }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const googleLogin = async (idToken) => {
    try {
      // Mock Google login for development without backend
      const mockUser = {
        id: '1',
        email: 'google.user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        onboardingCompleted: false
      }
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Welcome to Postcard!')
      
      return { data: { user: mockUser, token: mockToken, isNewUser: true } }
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}