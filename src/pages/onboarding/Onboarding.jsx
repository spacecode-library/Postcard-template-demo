import { Routes, Route, Navigate } from 'react-router-dom'
import OnboardingStep1 from './OnboardingStep1'
import OnboardingStep2 from './OnboardingStep2'

const Onboarding = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="step1" replace />} />
      <Route path="step1" element={<OnboardingStep1 />} />
      <Route path="step2/*" element={<OnboardingStep2 />} />
    </Routes>
  )
}

export default Onboarding