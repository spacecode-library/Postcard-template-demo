import { Routes, Route, Navigate } from 'react-router-dom';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import OnboardingStep4 from './OnboardingStep4';
import OnboardingStep5 from './OnboardingStep5';
import OnboardingStep6 from './OnboardingStep6';

const Onboarding = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="step1" replace />} />
      <Route path="step1" element={<OnboardingStep1 />} />
      <Route path="step2" element={<OnboardingStep2 />} />
      <Route path="step3" element={<OnboardingStep3 />} />
      <Route path="step4" element={<OnboardingStep4 />} />
      <Route path="step5" element={<OnboardingStep5 />} />
\      {<Route path="step6" element={<OnboardingStep6 />} /> }
    </Routes>
  );
};

export default Onboarding;