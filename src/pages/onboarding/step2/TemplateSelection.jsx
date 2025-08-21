import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import templateService from '../../../services/template.service'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ProgressSidebar from '../components/ProgressSidebar'
import '../onboarding.css'

// Mock template data - fallback if API fails
const mockTemplates = [
  {
    id: '1',
    name: 'Welcome New Neighbor',
    description: 'Perfect for reaching out to new movers in your area',
    category: 'new_mover',
    frontImageUrl: 'https://via.placeholder.com/300x200/7F56D9/FFFFFF?text=Welcome+Template',
  },
  {
    id: '2',
    name: 'Local Business Promo',
    description: 'Highlight your services to nearby residents',
    category: 'radius',
    frontImageUrl: 'https://via.placeholder.com/300x200/079455/FFFFFF?text=Promo+Template',
  },
  {
    id: '3',
    name: 'Seasonal Offer',
    description: 'Great for holiday promotions and seasonal deals',
    category: 'custom',
    frontImageUrl: 'https://via.placeholder.com/300x200/F04438/FFFFFF?text=Seasonal+Template',
  },
  {
    id: '4',
    name: 'Grand Opening',
    description: 'Announce your new location to the community',
    category: 'custom',
    frontImageUrl: 'https://via.placeholder.com/300x200/1570EF/FFFFFF?text=Grand+Opening',
  },
]

const TemplateSelection = ({ currentStep, onboardingData, updateOnboardingData, onNext, onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(onboardingData.template?.id || null)
  
  // Fetch templates from API
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const response = await templateService.getTemplates({ limit: 20 })
        return response.data.templates
      } catch (error) {
        console.error('Failed to load templates:', error)
        return mockTemplates // Fallback to mock templates
      }
    },
  })
  
  const templates = templatesData || mockTemplates

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id)
    updateOnboardingData('template', template)
  }

  const handleNext = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template to continue')
      return
    }
    onNext()
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-logo">
        <span>Postcard</span>
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
            <h1 className="content-title">Choose a postcard template</h1>
            <p className="content-subtitle">
              Select a template that best fits your marketing goals. You can customize it in the next step.
            </p>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <LoadingSpinner size="large" />
              <p style={{ marginTop: '16px', color: '#667085' }}>Loading templates...</p>
            </div>
          ) : (
            <div className="template-grid">
              {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => handleSelectTemplate(template)}
              >
                <img
                  src={template.frontImageUrl}
                  alt={template.name}
                  className="template-image"
                />
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
              </div>
              ))}
            </div>
          )}

          <div className="action-buttons">
            <button
              type="button"
              className="primary-button"
              onClick={handleNext}
              disabled={!selectedTemplate}
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

export default TemplateSelection