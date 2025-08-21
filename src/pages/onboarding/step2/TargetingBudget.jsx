import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProgressSidebar from '../components/ProgressSidebar'
import '../onboarding.css'

const TargetingBudget = ({ currentStep, onboardingData, updateOnboardingData, onNext, onBack }) => {
  const [targeting, setTargeting] = useState(onboardingData.targeting || {
    type: 'radius',
    radius: 5,
    zipCodes: [],
  })
  
  const [budget, setBudget] = useState(onboardingData.budget || {
    amount: 500,
    frequency: 'monthly',
  })

  const handleNext = () => {
    updateOnboardingData('targeting', targeting)
    updateOnboardingData('budget', budget)
    onNext()
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
            <h1 className="content-title">Target audience & budget</h1>
            <p className="content-subtitle">
              Define who should receive your postcards and set your budget.
            </p>
          </div>

          <div style={{ 
            padding: '40px', 
            background: '#F9FAFB', 
            borderRadius: '12px',
            marginTop: '32px' 
          }}>
            <h3 style={{ marginBottom: '16px' }}>Targeting Options</h3>
            <p style={{ color: '#535862', marginBottom: '24px' }}>
              Choose radius targeting or specific zip codes.
            </p>
            
            <h3 style={{ marginBottom: '16px' }}>Budget Settings</h3>
            <p style={{ color: '#535862' }}>
              Set your monthly budget for postcard campaigns.
            </p>
          </div>

          <div className="action-buttons" style={{ marginTop: '32px' }}>
            <button
              type="button"
              className="primary-button"
              onClick={handleNext}
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TargetingBudget