import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Calendar, MapPin, Plus } from 'lucide-react';
import ProcessLayout from '../../components/process/ProcessLayout';
import { LoadingSpinner, EmptyState, Button, StatusBadge } from '../../components/ui';
import campaignService from '../../supabase/api/campaignService';
import toast from 'react-hot-toast';

const BlastStep1 = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalSteps = 5;

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const result = await campaignService.getCampaigns();

      if (result.success) {
        // Filter only active or completed campaigns
        const eligibleCampaigns = result.campaigns.filter(
          campaign => campaign.status === 'active' || campaign.status === 'completed'
        );
        setCampaigns(eligibleCampaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/history');
  };

  const handleContinue = () => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign');
      return;
    }

    // Store blast data in sessionStorage
    sessionStorage.setItem('blastData', JSON.stringify({
      step: 1,
      sourceCampaignId: selectedCampaign.id,
      campaignName: selectedCampaign.campaign_name,
      templateId: selectedCampaign.template_id,
      templateName: selectedCampaign.template_name,
      postcardDesignUrl: selectedCampaign.postcard_design_url,
      postcardPreviewUrl: selectedCampaign.postcard_preview_url
    }));

    navigate('/blast/step2');
  };

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
  };

  if (isLoading) {
    return (
      <ProcessLayout currentStep={1} totalSteps={totalSteps} showFooter={false}>
        <LoadingSpinner
          message="Loading your campaigns..."
          submessage="Fetching campaigns you can reuse"
        />
      </ProcessLayout>
    );
  }

  if (campaigns.length === 0) {
    return (
      <ProcessLayout currentStep={1} totalSteps={totalSteps} showFooter={false}>
        <motion.button
          className="process-back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={18} />
          Back to History
        </motion.button>

        <EmptyState
          icon="📭"
          title="No Campaigns Available"
          description="You need at least one active or completed campaign to create a blast. Start by creating your first campaign."
          actionLabel="Create Your First Campaign"
          actionIcon={<Plus />}
          onAction={() => navigate('/create-campaign')}
          secondaryActionLabel="Go Back"
          onSecondaryAction={() => navigate('/history')}
        />
      </ProcessLayout>
    );
  }

  return (
    <ProcessLayout
      currentStep={1}
      totalSteps={totalSteps}
      footerMessage="Select the campaign you want to send as a new blast"
      onContinue={handleContinue}
      continueDisabled={!selectedCampaign}
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
        Back to History
      </motion.button>

      <h1 className="process-title">Select Campaign to Reuse</h1>
      <p className="process-subtitle">
        Choose a campaign to send as a blast to new movers in different or additional areas
      </p>

        <div className="campaigns-grid">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              className={`campaign-card ${selectedCampaign?.id === campaign.id ? 'selected' : ''}`}
              onClick={() => handleSelectCampaign(campaign)}
              whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedCampaign?.id === campaign.id && (
                <motion.div
                  layoutId="campaign-checkmark"
                  className="checkmark-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg
                    className="checkmark-icon"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
              )}

              <div className="campaign-preview">
                {campaign.postcard_preview_url ? (
                  <img
                    src={campaign.postcard_preview_url}
                    alt={campaign.campaign_name}
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-placeholder">
                    <span>No Preview</span>
                  </div>
                )}
              </div>

              <div className="campaign-info">
                <h3 className="campaign-name">{campaign.campaign_name}</h3>

                <div className="campaign-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>

                  {campaign.target_zip_codes && campaign.target_zip_codes.length > 0 && (
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{campaign.target_zip_codes.length} ZIP{campaign.target_zip_codes.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <StatusBadge status={campaign.status} />
              </div>
            </motion.div>
          ))}
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
          to {
            transform: rotate(360deg);
          }
        }

        .loading-content h2 {
          color: #2d3748;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .loading-content p {
          color: #718096;
          font-size: 14px;
          margin: 0;
        }

        .empty-campaigns {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 400px);
          text-align: center;
          animation: fadeIn 0.3s ease-out;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .empty-campaigns h2 {
          color: #2d3748;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .empty-campaigns p {
          color: #718096;
          margin: 0 0 30px 0;
          font-size: 14px;
          line-height: 1.6;
          max-width: 400px;
        }

        .create-campaign-button {
          padding: 12px 24px;
          background: #20B2AA;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-campaign-button:hover {
          background: #17a097;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(32, 178, 170, 0.3);
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 32px;
          margin-bottom: 32px;
        }

        .campaign-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .campaign-card.selected {
          border-color: #20B2AA;
          box-shadow: 0 0 0 3px rgba(32, 178, 170, 0.1);
        }

        .checkmark-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: #20B2AA;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(32, 178, 170, 0.3);
          z-index: 10;
        }

        .checkmark-icon {
          width: 18px;
          height: 18px;
          color: white;
        }

        .campaign-preview {
          width: 100%;
          height: 200px;
          background: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #cbd5e0;
          font-size: 14px;
          font-weight: 500;
        }

        .campaign-info {
          padding: 16px;
        }

        .campaign-name {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .campaign-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #718096;
        }

        .meta-item svg {
          flex-shrink: 0;
        }

        .campaign-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-draft {
          background: #f3f4f6;
          color: #4b5563;
        }
      `}</style>
    </ProcessLayout>
  );
};

export default BlastStep1;
