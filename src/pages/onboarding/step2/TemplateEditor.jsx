import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProgressSidebar from '../components/ProgressSidebar'
import '../onboarding.css'

const TemplateEditor = ({ currentStep, onboardingData, updateOnboardingData, onNext, onBack }) => {
  const [editedTemplate, setEditedTemplate] = useState(onboardingData.editedTemplate || {
    ...onboardingData.template,
    customText: '',
    customColors: {},
  })

  const handleNext = () => {
    updateOnboardingData('editedTemplate', editedTemplate)
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
            <h1 className="content-title">Customize your postcard</h1>
            <p className="content-subtitle">
              Edit the template to match your brand and message.
            </p>
          </div>

          <div style={{ 
            padding: '40px', 
            background: '#F9FAFB', 
            borderRadius: '12px',
            textAlign: 'center',
            marginTop: '32px' 
          }}>
            <h3 style={{ marginBottom: '16px' }}>Template Editor</h3>
            <p style={{ color: '#535862' }}>
              Template editing interface will be implemented here.
              <br />
              This will include text editing, color customization, and preview.
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

export default TemplateEditor