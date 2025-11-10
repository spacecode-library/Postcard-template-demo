import { supabase } from "../integration/client"

/**
 * Supabase Onboarding Service
 * Handles onboarding progress tracking
 */
const supabaseOnboardingService = {
  /**
   * Get onboarding status for current user
   * @returns {Promise<Object>} Onboarding status including current step and completion
   */
  async getOnboardingStatus() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Get onboarding progress data (single source of truth)
      // Handle 406 errors gracefully if table doesn't exist or has permission issues
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Handle various error cases
      if (progressError) {
        // PGRST116 is "not found" error, which is fine for new users
        if (progressError.code === 'PGRST116') {
          console.log('New user - no onboarding progress yet')
        }
        // 42P01 is "relation does not exist" - table doesn't exist
        else if (progressError.code === '42P01') {
          console.warn('⚠️  onboarding_progress table does not exist - proceeding with defaults')
        }
        // 406 errors or other permission issues - log but continue
        else if (progressError.message?.includes('406') || progressError.message?.includes('permission')) {
          console.warn('⚠️  Permission issue with onboarding_progress table - proceeding with defaults:', progressError.message)
        }
        else {
          console.warn('Onboarding progress query warning:', progressError)
        }
      }

      // Map schema columns to expected format
      return {
        userId: user.id,
        onboardingCompleted: progress?.onboarding_completed || false,
        currentStep: progress?.current_step || 1, // Use current_step from schema
        completedAt: progress?.updated_at, // Use updated_at as completion timestamp
        progress: progress || null,
        hasFirstCampaign: false, // Remove non-existent column reference
        firstCampaignId: null // Remove non-existent column reference
      }
    } catch (error) {
      console.error('Get onboarding status error:', error)
      // Don't throw - return default values instead
      return {
        userId: null,
        onboardingCompleted: false,
        currentStep: 1,
        completedAt: null,
        progress: null,
        hasFirstCampaign: false,
        firstCampaignId: null
      }
    }
  },

  /**
   * Mark a specific onboarding step as complete
   * @param {number} stepNumber - Step number (1-6)
   * @returns {Promise<Object>} Updated onboarding data
   */
  async markStepComplete(stepNumber) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      if (stepNumber < 1 || stepNumber > 6) {
        throw new Error('Invalid step number. Must be between 1 and 6.')
      }

      // Get existing progress to update completed_steps array
      const { data: existing, error: checkError } = await supabase
        .from('onboarding_progress')
        .select('completed_steps')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // Build completed_steps array (add stepNumber if not already included)
      let completedSteps = existing?.completed_steps || []
      if (!completedSteps.includes(stepNumber)) {
        completedSteps.push(stepNumber)
      }

      const updateData = {
        current_step: stepNumber,
        completed_steps: completedSteps,
        updated_at: new Date().toISOString()
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('onboarding_progress')
          .update(updateData)
          .eq('user_id', user.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            ...updateData,
            created_at: new Date().toISOString()
          })

        if (insertError) {
          throw insertError
        }
      }

      return {
        message: `Step ${stepNumber} marked as complete`,
        currentStep: stepNumber
      }
    } catch (error) {
      console.error('Mark step complete error:', error)
      throw {
        error: error.message || 'Failed to mark step as complete',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Complete the entire onboarding process
   * @param {string} campaignId - ID of the first campaign created
   * @returns {Promise<Object>} Completion confirmation
   */
  async completeOnboarding(campaignId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const completedAt = new Date().toISOString()

      // Update onboarding_progress - mark all steps and overall as complete
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          current_step: 6,
          completed_steps: [1, 2, 3, 4, 5, 6],
          updated_at: completedAt
        })

      if (progressError) {
        throw progressError
      }

      return {
        message: 'Onboarding completed successfully!',
        onboardingCompleted: true,
        completedAt: completedAt
      }
    } catch (error) {
      console.error('Complete onboarding error:', error)
      throw {
        error: error.message || 'Failed to complete onboarding',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Reset onboarding progress (for testing/admin purposes)
   * @returns {Promise<Object>} Reset confirmation
   */
  async resetOnboarding() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Delete onboarding_progress record
      const { error: deleteError } = await supabase
        .from('onboarding_progress')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.warn('Error deleting progress:', deleteError)
      }

      return {
        message: 'Onboarding reset successfully',
        onboardingCompleted: false,
        currentStep: 1
      }
    } catch (error) {
      console.error('Reset onboarding error:', error)
      throw {
        error: error.message || 'Failed to reset onboarding',
        statusCode: error.statusCode || 400
      }
    }
  }
}

export default supabaseOnboardingService
