import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit3, CheckCircle } from 'lucide-react';
import ProcessLayout from '../../components/process/ProcessLayout';
import PostcardEditorNew from '../../components/PostcardEditor/PostcardEditorNew';
import toast from 'react-hot-toast';

const BlastStep2 = () => {
  const navigate = useNavigate();
  const [blastData, setBlastData] = useState(null);
  const [isEditingPostcard, setIsEditingPostcard] = useState(false);
  const [postcardDesignUrl, setPostcardDesignUrl] = useState(null);
  const [postcardPreviewUrl, setPostcardPreviewUrl] = useState(null);

  const totalSteps = 5;

  useEffect(() => {
    // Load blast data from sessionStorage
    const savedBlastData = sessionStorage.getItem('blastData');
    if (!savedBlastData) {
      toast.error('No campaign selected. Please start over.');
      navigate('/blast/step1');
      return;
    }

    const data = JSON.parse(savedBlastData);
    setBlastData(data);
    setPostcardDesignUrl(data.postcardDesignUrl);
    setPostcardPreviewUrl(data.postcardPreviewUrl);
  }, [navigate]);

  const handleBack = () => {
    navigate('/blast/step1');
  };

  const handleEditPostcard = () => {
    setIsEditingPostcard(true);
  };

  const handleCloseEditor = () => {
    setIsEditingPostcard(false);
  };

  const handleSavePostcard = (designUrl, previewUrl) => {
    // Update the URLs
    setPostcardDesignUrl(designUrl);
    setPostcardPreviewUrl(previewUrl);

    // Update blast data in sessionStorage
    const updatedBlastData = {
      ...blastData,
      postcardDesignUrl: designUrl,
      postcardPreviewUrl: previewUrl,
      wasEdited: true
    };
    sessionStorage.setItem('blastData', JSON.stringify(updatedBlastData));
    setBlastData(updatedBlastData);
    setIsEditingPostcard(false);

    toast.success('Postcard design updated!');
  };

  const handleContinue = () => {
    // Save step progress
    const updatedBlastData = {
      ...blastData,
      step: 2,
      postcardDesignUrl,
      postcardPreviewUrl
    };
    sessionStorage.setItem('blastData', JSON.stringify(updatedBlastData));

    navigate('/blast/step3');
  };

  const handleSkipEditing = () => {
    handleContinue();
  };

  if (!blastData) {
    return (
      <ProcessLayout currentStep={2} totalSteps={totalSteps} showFooter={false}>
        <div className="blast-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading...</h2>
          </div>
        </div>
      </ProcessLayout>
    );
  }

  // If editing postcard, show full-screen editor
  if (isEditingPostcard) {
    const templateData = {
      id: blastData.templateId,
      name: blastData.templateName,
      psdPath: postcardDesignUrl,
      preview: postcardPreviewUrl
    };

    return (
      <div className="blast-editor-fullscreen">
        <PostcardEditorNew
          selectedTemplate={templateData}
          onBack={handleCloseEditor}
          onSave={handleSavePostcard}
        />
      </div>
    );
  }

  return (
    <ProcessLayout
      currentStep={2}
      totalSteps={totalSteps}
      footerMessage="Review your postcard design before continuing"
      onContinue={handleContinue}
      continueDisabled={false}
      onSkip={() => navigate('/history')}
      skipText="Cancel"
    >
      <motion.button
        className="process-back-button"
        onClick={handleBack}
        whileHover={{ scale: 1.02, x: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <ChevronLeft size={18} />
        Back
      </motion.button>

      <h1 className="process-title">Review Postcard Design</h1>
      <p className="process-subtitle">
        Your postcard is ready to send. You can edit it if needed or continue with the current design.
      </p>

        <div className="design-review-section">
          <div className="design-header">
            <div className="header-content">
              <h3>Campaign: {blastData.campaignName}</h3>
              {blastData.wasEdited && (
                <div className="edited-badge">
                  <CheckCircle size={16} />
                  <span>Modified</span>
                </div>
              )}
            </div>
            <motion.button
              className="edit-design-button"
              onClick={handleEditPostcard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 size={16} />
              Edit Design
            </motion.button>
          </div>

          <div className="postcard-preview-container">
            {postcardPreviewUrl ? (
              <img
                src={postcardPreviewUrl}
                alt="Postcard preview"
                className="postcard-preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <span>No preview available</span>
              </div>
            )}
          </div>

          <div className="design-actions">
            <motion.button
              className="skip-button"
              onClick={handleSkipEditing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Keep Current Design
            </motion.button>
          </div>
        </div>

      <style jsx>{`
        .blast-loading {
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
          to { transform: rotate(360deg); }
        }

        .loading-content h2 {
          color: #2d3748;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .blast-editor-fullscreen {
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .design-review-section {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-top: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .design-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f7fafc;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-content h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .edited-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .edit-design-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #20B2AA;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-design-button:hover {
          background: #17a097;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(32, 178, 170, 0.3);
        }

        .edit-design-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(32, 178, 170, 0.2);
        }

        .postcard-preview-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: #f7fafc;
          max-height: 400px;
          overflow: hidden;
        }

        .postcard-preview-image {
          max-width: 100%;
          max-height: 350px;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 300px;
          color: #cbd5e0;
          font-size: 16px;
          font-weight: 500;
        }

        .design-actions {
          padding: 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: center;
        }

        .skip-button {
          padding: 10px 20px;
          background: white;
          color: #4a5568;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .skip-button:hover {
          background: #edf2f7;
          border-color: #cbd5e0;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .skip-button:active {
          transform: translateY(0);
          box-shadow: none;
        }
      `}</style>
    </ProcessLayout>
  );
};

export default BlastStep2;
