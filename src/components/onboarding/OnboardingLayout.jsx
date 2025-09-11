import React from 'react';
import OnboardingSidebar from './OnboardingSidebar';
// Import the unified CSS that properly handles layout and footer
import '../../pages/onboarding/onboarding-unified.css';

const OnboardingLayout = ({ children, currentStep = 1, steps, onStepClick }) => {
  return (
    <div className="onboarding-container">
      <OnboardingSidebar 
        steps={steps} 
        currentStep={currentStep}
        onStepClick={onStepClick}
      />
      <div className="onboarding-main">
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;