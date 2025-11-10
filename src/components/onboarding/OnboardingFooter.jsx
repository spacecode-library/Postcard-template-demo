import React from 'react';

const OnboardingFooter = ({
  message,
  currentStep,
  totalSteps,
  onContinue,
  continueDisabled = false,
  continueText = "Continue",
  // Optional secondary action (e.g., for Step 6 "Pay Later" button)
  secondaryAction = null,
  secondaryText = null,
  secondaryDisabled = false,
  className = ""
}) => {
  return (
    <div className={`footer-section ${className}`}>
      <div className="footer-actions" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left side: Optional helper message (keep it short) */}
        {message && <span className="footer-hint" style={{
          fontSize: '0.875rem',
          color: '#64748b',
          maxWidth: '50%',
          flexShrink: 1
        }}>{message}</span>}

        {/* Right side: Action buttons */}
        {secondaryAction ? (
          <div className="final-actions" style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button
              className="pay-later-button"
              onClick={secondaryAction}
              disabled={secondaryDisabled}
            >
              {secondaryText}
            </button>
            <button
              className="continue-button"
              onClick={onContinue}
              disabled={continueDisabled}
            >
              {continueText}
            </button>
          </div>
        ) : (
          <button
            className="continue-button"
            onClick={onContinue}
            disabled={continueDisabled}
            style={{ marginLeft: 'auto' }}
          >
            {continueText}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFooter;