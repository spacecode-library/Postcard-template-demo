import React from 'react';
import ProcessStepIndicator from './ProcessStepIndicator';
import ProcessFooter from './ProcessFooter';
import '../../styles/process-layout.css';

const ProcessLayout = ({
  children,
  currentStep,
  totalSteps,
  footerMessage,
  onContinue,
  continueDisabled = false,
  continueText = 'Continue',
  showFooter = true,
  onSkip,
  skipText = 'Cancel'
}) => {
  return (
    <div className="process-container">
      {/* Top Progress Bar */}
      <ProcessStepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        onSkip={onSkip}
        skipText={skipText}
      />

      {/* Main Content Area */}
      <div className="process-content">
        <div className="process-content-inner">
          {children}
        </div>
      </div>

      {/* Footer */}
      {showFooter && (
        <ProcessFooter
          message={footerMessage}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onContinue={onContinue}
          continueDisabled={continueDisabled}
          continueText={continueText}
        />
      )}
    </div>
  );
};

export default ProcessLayout;
