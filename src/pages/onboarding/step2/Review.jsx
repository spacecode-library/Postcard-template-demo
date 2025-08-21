import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import toast from 'react-hot-toast'
import ProgressSidebar from '../components/ProgressSidebar'
import '../onboarding.css'

const Review = ({ currentStep, onboardingData, updateOnboardingData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateUser } = useAuth()

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Mark onboarding as completed
      const user = JSON.parse(localStorage.getItem('user'))
      const updatedUser = { ...user, onboardingCompleted: true }
      updateUser(updatedUser)
      
      toast.success('Onboarding completed! Welcome to Postcard!')
      onNext()
    } catch (error) {
      toast.error('Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-logo">
        <span>Logo</span>
      </div>

      <ProgressSidebar currentStep={currentStep} />
      
      <div className="vertical-divider" />
      
      <main className="onboarding-main">
        <nav className="onboarding-nav">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </nav>

        <div className="onboarding-content">
          <div className="content-header">
            <h1 className="content-title">Review your campaign</h1>
            <p className="content-subtitle">
              Everything looks great! Review your settings before launching.
            </p>
          </div>

          <div style={{ marginTop: '32px' }}>
            <div style={{ 
              padding: '24px', 
              background: '#F9FAFB', 
              borderRadius: '12px',
              marginBottom: '16px' 
            }}>
              <h3 style={{ marginBottom: '16px' }}>Company Information</h3>
              <p style={{ color: '#535862' }}>
                {onboardingData.companyInfo?.name || 'Your Company'}<br />
                {onboardingData.website}
              </p>
            </div>

            <div style={{ 
              padding: '24px', 
              background: '#F9FAFB', 
              borderRadius: '12px',
              marginBottom: '16px' 
            }}>
              <h3 style={{ marginBottom: '16px' }}>Selected Template</h3>
              <p style={{ color: '#535862' }}>
                {onboardingData.template?.name || 'Template Name'}
              </p>
            </div>

            <div style={{ 
              padding: '24px', 
              background: '#F9FAFB', 
              borderRadius: '12px'
            }}>
              <h3 style={{ marginBottom: '16px' }}>Targeting & Budget</h3>
              <p style={{ color: '#535862' }}>
                Radius: {onboardingData.targeting?.radius || 5} miles<br />
                Budget: ${onboardingData.budget?.amount || 500}/month
              </p>
            </div>
          </div>

          <div className="action-buttons" style={{ marginTop: '32px' }}>
            <button
              type="button"
              className="primary-button"
              onClick={handleComplete}
              disabled={isLoading}
              style={{ background: '#079455' }}
            >
              {isLoading ? 'Completing...' : 'Complete Setup'}
              <Check size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Review