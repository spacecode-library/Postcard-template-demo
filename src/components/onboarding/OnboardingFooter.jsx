import React from 'react';

const OnboardingFooter = ({ 
  message, 
  currentStep, 
  totalSteps, 
  onContinue, 
  continueDisabled = false,
  continueText = "Continue",
  className = ""
}) => {
  return (
    <div className={`footer-section ${className}`}>
      {message && <p className="footer-text">{message}</p>}
      <div className="footer-actions">
        <span className="step-indicator">Step {currentStep} of {totalSteps}</span>
        <button 
          className="continue-button" 
          onClick={onContinue}
          disabled={continueDisabled}
        >
          {continueText}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFooter;