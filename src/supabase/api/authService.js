import { supabase } from "../integration/client"

const supabaseAuthService = {
  /**
   * Register a new user with email and password
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User full name
   * @returns {Promise<Object>} User data and session
   */
  async register({ email, password, name }) {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      })
      if (signUpError) {
            throw signUpError
      }

      const { error } = await supabase.from('profile').insert({ user_id:authData.user.id,full_name:name, email:email });

      if(error){
        throw error
      }

    

      // Return user data
      return {
        user: authData.user,
        session: authData.session,
        message: 'Registration successful! Please check your email to verify your account.'
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw {
        error: error.message || 'Registration failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and session
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Login successful!'
      }
    } catch (error) {
      console.error('Login error:', error)
      throw {
        error: error.message || 'Login failed',
        statusCode: error.status || 401
      }
    }
  },

  /**
   * Login with Google OAuth
   * @returns {Promise<Object>} OAuth response
   */
  async googleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      })

      if (error) {
        throw error
      }

      return {
        data,
        message: 'Redirecting to Google...'
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw {
        error: error.message || 'Google login failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      return {
        message: 'Logout successful!'
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw {
        error: error.message || 'Logout failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Get current user session
   * @returns {Promise<Object>} Current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return session
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  /**
   * Get current user
   * @returns {Promise<Object>} Current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }

      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        throw error
      }

      return {
        user: data.user,
        message: 'Profile updated successfully!'
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw {
        error: error.message || 'Profile update failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Response
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return {
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      throw {
        error: error.message || 'Password reset failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Update password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return {
        message: 'Password updated successfully!'
      }
    } catch (error) {
      console.error('Update password error:', error)
      throw {
        error: error.message || 'Password update failed',
        statusCode: error.status || 400
      }
    }
  },

  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function
   * @returns {Object} Subscription object
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

export default supabaseAuthService