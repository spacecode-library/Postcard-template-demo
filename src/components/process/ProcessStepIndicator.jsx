import React from 'react';

const ProcessStepIndicator = ({
  currentStep,
  totalSteps,
  onSkip,
  skipText = 'Cancel',
  // Editor-specific props
  editorMode,
  onModeChange,
  isDoubleSided,
  currentPage,
  onPageChange,
  onSave,
  isSaving,
  templateName
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const isEditorMode = editorMode !== undefined;

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
        zIndex: '100',
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
        {/* Header with step text, editor controls (if editor mode), and percentage */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            gap: '16px'
          }}
        >
          {/* Left: Step text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px' }}>
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
            {templateName && (
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                • {templateName}
              </span>
            )}
          </div>

          {/* Center: Editor controls (only in editor mode) */}
          {isEditorMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
              {/* Page Toggle (Front/Back) */}
              {isDoubleSided && onPageChange && (
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '8px', padding: '4px', border: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => onPageChange('front')}
                    style={{
                      padding: '6px 14px',
                      background: currentPage === 'front' ? '#20B2AA' : '#FFFFFF',
                      color: currentPage === 'front' ? '#FFFFFF' : '#4B5563',
                      border: currentPage === 'front' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: currentPage === 'front' ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => onPageChange('back')}
                    style={{
                      padding: '6px 14px',
                      background: currentPage === 'back' ? '#20B2AA' : '#FFFFFF',
                      color: currentPage === 'back' ? '#FFFFFF' : '#4B5563',
                      border: currentPage === 'back' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: currentPage === 'back' ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Back
                  </button>
                </div>
              )}

              {/* Mode Toggle (Simple/Advanced) */}
              {onModeChange && (
                <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', borderRadius: '8px', padding: '4px', border: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => onModeChange('simple')}
                    style={{
                      padding: '6px 14px',
                      background: editorMode === 'simple' ? '#20B2AA' : '#FFFFFF',
                      color: editorMode === 'simple' ? '#FFFFFF' : '#4B5563',
                      border: editorMode === 'simple' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: editorMode === 'simple' ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => onModeChange('advanced')}
                    style={{
                      padding: '6px 14px',
                      background: editorMode === 'advanced' ? '#20B2AA' : '#FFFFFF',
                      color: editorMode === 'advanced' ? '#FFFFFF' : '#4B5563',
                      border: editorMode === 'advanced' ? 'none' : '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: editorMode === 'advanced' ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Advanced
                  </button>
                </div>
              )}

              {/* Save Button */}
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#20B2AA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(32, 178, 170, 0.1)'
                  }}
                  onMouseEnter={(e) => !isSaving && (e.target.style.background = '#1a9d96')}
                  onMouseLeave={(e) => (e.target.style.background = '#20B2AA')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {isSaving ? 'Saving...' : 'Save Design'}
                </button>
              )}
            </div>
          )}

          {/* Right: Skip and percentage */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              minWidth: '100px',
              justifyContent: 'flex-end'
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
