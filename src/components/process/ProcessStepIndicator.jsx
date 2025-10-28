import React from 'react';

const ProcessStepIndicator = ({ currentStep, totalSteps, onSkip, skipText = 'Cancel' }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  // Define styles as objects to ensure they're applied
  const trackStyle = {
    width: '100%',
    height: '8px',
    minHeight: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative',
    display: 'block'
  };

  const fillStyle = {
    width: `${percentage}%`,
    height: '8px',
    minHeight: '8px',
    backgroundColor: '#20B2AA',
    borderRadius: '9999px',
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'block'
  };

  return (
    <div
      style={{
        height: '80px',
        width: '100%',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '9999',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* Header with step text and percentage */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}
        >
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              letterSpacing: '0.025em'
            }}
          >
            Step {currentStep} of {totalSteps}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {onSkip && (
              <button
                onClick={onSkip}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#374151'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              >
                {skipText}
              </button>
            )}
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#4b5563',
                minWidth: '3rem',
                textAlign: 'right'
              }}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div style={trackStyle} data-progress-track="true">
          {/* Progress Bar Fill */}
          <div style={fillStyle} data-progress-fill="true" />
        </div>
      </div>
    </div>
  );
};

export default ProcessStepIndicator;
