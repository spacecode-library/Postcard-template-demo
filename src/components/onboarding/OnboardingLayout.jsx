import React from 'react';
import ProcessStepIndicator from '../process/ProcessStepIndicator';
import OnboardingFooter from './OnboardingFooter';
// Import the unified CSS that properly handles layout and footer
import '../../pages/onboarding/onboarding-unified.css';

const OnboardingLayout = ({
  children,
  currentStep = 1,
  steps,
  // Footer props
  footerMessage,
  onContinue,
  continueDisabled = false,
  continueText = 'Continue',
  showFooter = true,
  secondaryAction = null,
  secondaryText = null,
  secondaryDisabled = false,
  // Editor-specific props for Step 3
  editorMode,
  onModeChange,
  isDoubleSided,
  currentPage,
  onPageChange,
  onSave,
  isSaving,
  templateName
}) => {
  const totalSteps = steps ? steps.length : 6;

  return (
    <div className="onboarding-container">
      {/* Top Progress Bar */}
      <ProcessStepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        // Pass editor props (only used in Step 3)
        editorMode={editorMode}
        onModeChange={onModeChange}
        isDoubleSided={isDoubleSided}
        currentPage={currentPage}
        onPageChange={onPageChange}
        onSave={onSave}
        isSaving={isSaving}
        templateName={templateName}
      />

      {/* Main Content Area */}
      <div className="onboarding-main">
        {children}
      </div>

      {/* Footer - Rendered as sibling to match campaign flow architecture */}
      {showFooter && (
        <OnboardingFooter
          message={footerMessage}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onContinue={onContinue}
          continueDisabled={continueDisabled}
          continueText={continueText}
          secondaryAction={secondaryAction}
          secondaryText={secondaryText}
          secondaryDisabled={secondaryDisabled}
        />
      )}
    </div>
  );
};

export default OnboardingLayout;