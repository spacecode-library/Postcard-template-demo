import { supabase } from "../integration/client"

/**
 * Supabase Company Service
 * Handles all company-related database operations
 */
const supabaseCompanyService = {
  /**
   * Create or update company information
   * @param {Object} companyData - Company data to save
   * @returns {Promise<Object>} Saved company data
   */
  async saveCompanyInfo(companyData) {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare company data
      const companyRecord = {
        user_id: user.id,
        name: companyData.name,
        website: companyData.website,
        domain: companyData.domain,
        business_category: companyData.businessCategory,
        description: companyData.description,
        industry: companyData.industry,
        
        // Brand information
        logo_url: companyData.logo?.primary || null,
        logo_icon_url: companyData.logo?.icon || null,
        primary_color: companyData.colors?.primary || null,
        secondary_color: companyData.colors?.secondary || null,
        color_palette: companyData.colors?.palette || null,
        
        // Fonts
        fonts: companyData.fonts || null,
        
        // Social links
        social_links: companyData.socialLinks || null,
        
        // Additional company info
        founded: companyData.companyInfo?.founded || null,
        employees: companyData.companyInfo?.employees || null,
        location: companyData.companyInfo?.location || null,
        
        // Metadata
        brandfetch_data: companyData.rawData || null,
        // updated_at: new Date().toISOString()
      }

      // Check if company already exists for this user
      const { data: existingCompany, error: checkError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        throw checkError
      }

      let result

      if (existingCompany) {
        // Update existing company
        const { data, error } = await supabase
          .from('companies')
          .update(companyRecord)
          .eq('id', existingCompany.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert new company
        companyRecord.created_at = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('companies')
          .insert([companyRecord])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      return {
        company: result,
        message: 'Company information saved successfully!'
      }
    } catch (error) {
      console.error('Save company error:', error)
      throw {
        error: error.message || 'Failed to save company information',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Get company information for current user
   * @returns {Promise<Object>} Company data
   */
  async getCompanyInfo() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No company found - return null
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Get company error:', error)
      throw {
        error: error.message || 'Failed to retrieve company information',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Update specific company fields
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated company data
   */
  async updateCompanyInfo(updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Add updated timestamp
      updates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return {
        company: data,
        message: 'Company information updated successfully!'
      }
    } catch (error) {
      console.error('Update company error:', error)
      throw {
        error: error.message || 'Failed to update company information',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Delete company information
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteCompanyInfo() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      return {
        message: 'Company information deleted successfully!'
      }
    } catch (error) {
      console.error('Delete company error:', error)
      throw {
        error: error.message || 'Failed to delete company information',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Check if user has completed company setup
   * @returns {Promise<boolean>} True if company exists
   */
  async hasCompanyInfo() {
    try {
      const company = await this.getCompanyInfo()
      return !!company
    } catch (error) {
      return false
    }
  }
}

export default supabaseCompanyService