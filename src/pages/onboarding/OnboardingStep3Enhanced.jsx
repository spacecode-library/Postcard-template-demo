import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';
import PostcardEditorNew from '../../components/PostcardEditor/PostcardEditorNew';

const OnboardingStep3Enhanced = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  // Load selected template from localStorage (already enhanced from Step 2)
  useEffect(() => {
    const loadTemplateData = async () => {
      try {
        setLoading(true);
        
        // Load the selected template from Step 2
        const savedTemplate = localStorage.getItem('selectedTemplate');
        if (!savedTemplate) {
          setError('No template selected. Please go back and select a template.');
          return;
        }

        const selectedTemplate = JSON.parse(savedTemplate);
        console.log('Selected template from Step 2:', selectedTemplate);

        // Validate that we have a proper PSD template
        if (!selectedTemplate.psdFile) {
          throw new Error('Selected template does not have a PSD file. Please select a valid template.');
        }

        // Ensure the template has the required path structure for the editor
        const finalTemplate = {
          ...selectedTemplate,
          // Set up PSD path for the editor
          psdPath: `/PSD-files/${selectedTemplate.psdFile}`,
          // Ensure we have preview data
          preview: selectedTemplate.preview || null
        };

        console.log('Template ready for editor:', finalTemplate);
        setSelectedTemplate(finalTemplate);

      } catch (err) {
        console.error('Failed to load template:', err);
        setError(err.message || 'Failed to load template. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplateData();
  }, []);

  const handleBack = () => {
    navigate('/onboarding/step2');
  };

  const handleContinue = () => {
    // Save any editor data if needed
    navigate('/onboarding/step4');
  };

  const handleEditorBack = () => {
    handleBack();
  };

  if (loading) {
    return (
      <OnboardingLayout steps={steps} currentStep={3}>
        <div className="step3-loading">
          <div className="loading-spinner"></div>
          <h2>Setting up your postcard editor...</h2>
          <p>Loading template and initializing editor components</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (error) {
    return (
      <OnboardingLayout steps={steps} currentStep={3}>
        <div className="step3-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to load editor</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleBack} className="btn-secondary">
              Go Back to Templates
            </button>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh Page
            </button>
          </div>
        </div>

        <OnboardingFooter
          message="Please resolve the error to continue"
          currentStep={3}
          totalSteps={6}
          onContinue={handleContinue}
          continueDisabled={true}
          showBackButton={false}
        />
      </OnboardingLayout>
    );
  }

  if (!selectedTemplate) {
    return (
      <OnboardingLayout steps={steps} currentStep={3}>
        <div className="step3-no-template">
          <h2>No template selected</h2>
          <p>Please go back and select a template to continue.</p>
          <button onClick={handleBack} className="btn-primary">
            Select Template
          </button>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout steps={steps} currentStep={3}>
      <div className="step3-editor-container">
        <PostcardEditorNew 
          selectedTemplate={selectedTemplate}
          onBack={handleEditorBack}
        />
      </div>

      <OnboardingFooter
        message="Complete your postcard design and continue to targeting"
        currentStep={3}
        totalSteps={6}
        onContinue={handleContinue}
        continueDisabled={false}
        showBackButton={false} // PostcardEditor has its own back button
      />

      <style jsx>{`
        .step3-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #20B2AA;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .step3-loading h2 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 24px;
        }

        .step3-loading p {
          color: #718096;
          font-size: 16px;
        }

        .step3-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 40px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .step3-error h2 {
          color: #e53e3e;
          margin-bottom: 10px;
          font-size: 24px;
        }

        .step3-error p {
          color: #718096;
          margin-bottom: 30px;
          max-width: 500px;
        }

        .error-actions {
          display: flex;
          gap: 15px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background-color: #20B2AA;
          color: white;
        }

        .btn-primary:hover {
          background-color: #1a9391;
        }

        .btn-secondary {
          background-color: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background-color: #edf2f7;
        }

        .step3-no-template {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .step3-no-template h2 {
          color: #2d3748;
          margin-bottom: 10px;
        }

        .step3-no-template p {
          color: #718096;
          margin-bottom: 20px;
        }

        .step3-editor-container {
          /* Fill available space - footer is position:fixed so excluded from layout */
          width: 100%;
          height: 100%;
          flex: 1;
          min-height: 600px;
          position: relative;
          overflow: hidden;
        }

        /* Ensure the editor fills the available space */
        .step3-editor-container :global(.postcard-editor) {
          height: 100%;
        }
      `}</style>
    </OnboardingLayout>
  );
};

export default OnboardingStep3Enhanced;