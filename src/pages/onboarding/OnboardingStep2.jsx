import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import TemplateSelection from './step2/TemplateSelection'
import CompanyInfo from './step2/CompanyInfo'
import TemplateEditor from './step2/TemplateEditor'
import TargetingBudget from './step2/TargetingBudget'
import Review from './step2/Review'

const OnboardingStep2 = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [onboardingData, setOnboardingData] = useState({
    website: sessionStorage.getItem('companyWebsite') || '',
    enrichedData: JSON.parse(sessionStorage.getItem('enrichedData') || '{}'),
    template: null,
    companyInfo: {},
    editedTemplate: null,
    targeting: {},
    budget: {},
  })

  const updateOnboardingData = (key, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Get current sub-step from URL
  const getCurrentSubStep = () => {
    const path = location.pathname.split('/').pop()
    const steps = ['template', 'company-info', 'editor', 'targeting-budget', 'review']
    const index = steps.indexOf(path)
    return index >= 0 ? index + 2 : 2 // Steps 2-6 in the progress bar
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="template" replace />} />
      <Route 
        path="template" 
        element={
          <TemplateSelection 
            currentStep={2}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={() => navigate('/onboarding/step2/company-info')}
            onBack={() => navigate('/onboarding/step1')}
          />
        } 
      />
      <Route 
        path="company-info" 
        element={
          <CompanyInfo 
            currentStep={2}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={() => navigate('/onboarding/step2/editor')}
            onBack={() => navigate('/onboarding/step2/template')}
          />
        } 
      />
      <Route 
        path="editor" 
        element={
          <TemplateEditor 
            currentStep={3}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={() => navigate('/onboarding/step2/targeting-budget')}
            onBack={() => navigate('/onboarding/step2/company-info')}
          />
        } 
      />
      <Route 
        path="targeting-budget" 
        element={
          <TargetingBudget 
            currentStep={4}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={() => navigate('/onboarding/step2/review')}
            onBack={() => navigate('/onboarding/step2/editor')}
          />
        } 
      />
      <Route 
        path="review" 
        element={
          <Review 
            currentStep={6}
            onboardingData={onboardingData}
            updateOnboardingData={updateOnboardingData}
            onNext={() => {
              // Complete onboarding
              navigate('/dashboard')
            }}
            onBack={() => navigate('/onboarding/step2/targeting-budget')}
          />
        } 
      />
    </Routes>
  )
}

export default OnboardingStep2