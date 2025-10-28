import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const ProcessFooter = ({
  message,
  currentStep,
  totalSteps,
  onContinue,
  continueDisabled = false,
  continueText = 'Continue',
  showBackButton = false,
  onBack,
  children
}) => {
  return (
    <div className="process-footer">
      <div className="process-footer-content">
        {message && (
          <div className="footer-message">{message}</div>
        )}

        <div className="footer-actions">
          <span className="footer-step-indicator">
            Step {currentStep} of {totalSteps}
          </span>

          <div className="footer-buttons">
            {showBackButton && onBack && (
              <Button variant="secondary" size="md" onClick={onBack}>
                Back
              </Button>
            )}

            {children || (
              <Button
                variant="primary"
                size="md"
                onClick={onContinue}
                disabled={continueDisabled}
              >
                {continueText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFooter;
