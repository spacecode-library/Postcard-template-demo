import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProcessLayout from '../../components/process/ProcessLayout';
import PostcardEditorNew from '../../components/PostcardEditor/PostcardEditorNew';

const CampaignStep3 = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignId, setCampaignId] = useState(null);

  const totalSteps = 5;

  // Load selected template and campaign ID from localStorage
  useEffect(() => {
    const loadTemplateData = async () => {
      try {
        setLoading(true);

        // Load campaign ID
        const savedCampaignId = localStorage.getItem('currentCampaignId');
        if (!savedCampaignId) {
          setError('No campaign found. Please start from the beginning.');
          return;
        }
        setCampaignId(savedCampaignId);

        // Load the selected template from Step 2
        const savedTemplate = localStorage.getItem('campaignSelectedTemplate');
        if (!savedTemplate) {
          setError('No template selected. Please go back and select a template.');
          return;
        }

        const selectedTemplate = JSON.parse(savedTemplate);
        console.log('Selected template from Campaign Step 2:', selectedTemplate);

        // Validate that we have a proper PSD template
        if (!selectedTemplate.psdFile) {
          throw new Error('Selected template does not have a PSD file. Please select a valid template.');
        }

        // Ensure the template has the required path structure for the editor
        const finalTemplate = {
          ...selectedTemplate,
          psdPath: `/PSD-files/${selectedTemplate.psdFile}`,
          preview: selectedTemplate.preview || null
        };

        console.log('Template ready for editor:', finalTemplate);
        console.log('Campaign ID:', savedCampaignId);
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
    navigate('/campaign/step2');
  };

  const handleContinue = () => {
    localStorage.setItem('currentCampaignStep', '4');
    navigate('/campaign/step4');
  };

  const handleEditorBack = () => {
    handleBack();
  };

  const handleSaveDesign = (designData) => {
    console.log('Design saved:', designData);
    // Design URLs are already saved to database by PostcardEditorNew
    // Just store them in localStorage for Step 5
    localStorage.setItem('campaignDesignUrl', designData.designUrl);
    localStorage.setItem('campaignPreviewUrl', designData.previewUrl);
  };

  if (loading) {
    return (
      <ProcessLayout currentStep={3} totalSteps={totalSteps} showFooter={false}>
        <div className="step3-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Setting up your postcard editor...</h2>
            <p>Loading template and initializing editor components</p>
          </div>
        </div>
      </ProcessLayout>
    );
  }

  if (error) {
    return (
      <ProcessLayout
        currentStep={3}
        totalSteps={totalSteps}
        footerMessage="Please resolve the error to continue"
        onContinue={handleContinue}
        continueDisabled={true}
        onSkip={() => navigate('/dashboard')}
        skipText="Cancel"
      >
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
      </ProcessLayout>
    );
  }

  if (!selectedTemplate) {
    return (
      <ProcessLayout currentStep={3} totalSteps={totalSteps} showFooter={false}>
        <div className="step3-no-template">
          <h2>No template selected</h2>
          <p>Please go back and select a template to continue.</p>
          <button onClick={handleBack} className="btn-primary">
            Select Template
          </button>
        </div>
      </ProcessLayout>
    );
  }

  return (
    <ProcessLayout
      currentStep={3}
      totalSteps={totalSteps}
      footerMessage="Complete your postcard design and continue to targeting"
      onContinue={handleContinue}
      continueDisabled={false}
      onSkip={() => navigate('/dashboard')}
      skipText="Cancel"
    >
      <div className="step3-editor-container">
        <PostcardEditorNew
          selectedTemplate={selectedTemplate}
          onBack={handleEditorBack}
          onSave={handleSaveDesign}
          campaignId={campaignId}
        />
      </div>

      <style jsx>{`
        .step3-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          width: 100%;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #20B2AA;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .step3-loading h2 {
          color: #2d3748;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .step3-loading p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .step3-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          text-align: center;
          padding: 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .step3-error h2 {
          color: #e53e3e;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .step3-error p {
          color: #718096;
          margin: 0 0 30px 0;
          max-width: 500px;
          font-size: 14px;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          gap: 15px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
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
          background-color: #17a097;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(32, 178, 170, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(32, 178, 170, 0.2);
        }

        .btn-secondary {
          background-color: #f7fafc;
          color: #4a5568;
          border: 1.5px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background-color: #edf2f7;
          border-color: #cbd5e0;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .btn-secondary:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .step3-no-template {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          text-align: center;
          padding: 40px;
          animation: fadeIn 0.3s ease-out;
        }

        .step3-no-template h2 {
          color: #2d3748;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .step3-no-template p {
          color: #718096;
          margin: 0 0 24px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .step3-editor-container {
          width: 100%;
          height: 100%;
          flex: 1;
          min-height: 600px;
          position: relative;
          overflow: hidden;
        }

        .step3-editor-container :global(.postcard-editor) {
          height: 100%;
        }
      `}</style>
    </ProcessLayout>
  );
};

export default CampaignStep3;
