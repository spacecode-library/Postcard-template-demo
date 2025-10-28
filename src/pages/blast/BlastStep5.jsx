import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, MapPin, Send, CalendarClock, CheckCircle } from 'lucide-react';
import ProcessLayout from '../../components/process/ProcessLayout';
import campaignService from '../../supabase/api/campaignService';
import toast from 'react-hot-toast';

const BlastStep5 = () => {
  const navigate = useNavigate();
  const [blastData, setBlastData] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    // Load blast data from sessionStorage
    const savedBlastData = sessionStorage.getItem('blastData');
    if (!savedBlastData) {
      toast.error('Session expired. Please start over.');
      navigate('/blast/step1');
      return;
    }

    setBlastData(JSON.parse(savedBlastData));
  }, [navigate]);

  const handleBack = () => {
    navigate('/blast/step4');
  };

  const handleLaunchBlast = async () => {
    if (!blastData) return;

    setIsLaunching(true);

    try {
      toast.loading('Creating your blast...', { id: 'launch-blast' });

      // Prepare blast data for API
      const blastPayload = {
        name: `${blastData.campaignName} - Blast ${new Date().toLocaleDateString()}`,
        status: blastData.deliveryOption === 'now' ? 'active' : 'scheduled',
        template_id: blastData.templateId,
        template_name: blastData.templateName,
        postcard_design_url: blastData.postcardDesignUrl,
        postcard_preview_url: blastData.postcardPreviewUrl,
        targeting_type: 'zip_codes',
        target_zip_codes: blastData.zipCodes,
        validated_zips: blastData.validatedZips,
        zips_with_data: blastData.zipsWithData,
        postcards_sent: 0,
        price_per_postcard: blastData.flatRate,
        payment_status: 'pending',
        scheduled_send_date: blastData.scheduledDateTime || null,
        source_campaign_id: blastData.sourceCampaignId,
        is_blast: true
      };

      // Create blast campaign in database
      const result = await campaignService.createCampaign(blastPayload);

      if (!result.success) {
        throw new Error('Failed to create blast');
      }

      toast.success(
        blastData.deliveryOption === 'now'
          ? 'Blast launched successfully!'
          : 'Blast scheduled successfully!',
        { id: 'launch-blast' }
      );

      setIsLaunched(true);

      // Clear blast data from sessionStorage
      sessionStorage.removeItem('blastData');
    } catch (error) {
      console.error('Error launching blast:', error);
      toast.error(`Failed to launch blast: ${error.error || error.message}`, {
        id: 'launch-blast',
        duration: 5000
      });
    } finally {
      setIsLaunching(false);
    }
  };

  const handleGoToHistory = () => {
    navigate('/history');
  };

  const formatScheduledTime = () => {
    if (!blastData?.scheduledDateTime) return '';

    const date = new Date(blastData.scheduledDateTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!blastData) {
    return (
      <ProcessLayout currentStep={5} totalSteps={totalSteps} showFooter={false}>
        <div className="blast-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading...</h2>
          </div>
        </div>
      </ProcessLayout>
    );
  }

  if (isLaunched) {
    return (
      <ProcessLayout currentStep={5} totalSteps={totalSteps} showFooter={false}>
        <div className="success-content">
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <CheckCircle size={64} />
          </motion.div>

          <motion.h1
            className="success-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {blastData.deliveryOption === 'now'
              ? 'Blast Launched Successfully!'
              : 'Blast Scheduled Successfully!'}
          </motion.h1>

          <motion.p
            className="success-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {blastData.deliveryOption === 'now'
              ? `Your postcards are being sent to new movers in ${blastData.zipsWithData} ZIP code${blastData.zipsWithData !== 1 ? 's' : ''}`
              : `Your postcards will be sent on ${formatScheduledTime()}`}
          </motion.p>

          <motion.button
            className="dashboard-button"
            onClick={handleGoToHistory}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(32, 178, 170, 0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            Go to History
          </motion.button>
        </div>
      </ProcessLayout>
    );
  }

  return (
    <ProcessLayout currentStep={5} totalSteps={totalSteps} showFooter={false}>
      <div className="blast-content-wrapper">
        <motion.button
          className="process-back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={18} />
          Back
        </motion.button>

        <h1 className="process-title">Review & Launch Blast</h1>
        <p className="process-subtitle">
          Review your blast details before sending
        </p>

        {/* Postcard Preview Section */}
        <div className="review-section">
          <h2 className="section-title">Postcard Design</h2>
          <div className="postcard-preview-container">
            {blastData.postcardPreviewUrl ? (
              <img
                src={blastData.postcardPreviewUrl}
                alt="Postcard preview"
                className="postcard-preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                No preview available
              </div>
            )}
          </div>
        </div>

        {/* Blast Details Section */}
        <div className="review-section">
          <h2 className="section-title">Blast Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">Source Campaign</div>
              <div className="detail-value">{blastData.campaignName}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <MapPin size={16} />
                Target ZIP Codes
              </div>
              <div className="detail-value">
                {blastData.zipsWithData} ZIP{blastData.zipsWithData !== 1 ? 's' : ''} with new movers
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                {blastData.deliveryOption === 'now' ? <Send size={16} /> : <CalendarClock size={16} />}
                Delivery
              </div>
              <div className="detail-value">
                {blastData.deliveryOption === 'now' ? 'Send Immediately' : `Scheduled for ${formatScheduledTime()}`}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Rate per Postcard</div>
              <div className="detail-value detail-price">${blastData.flatRate?.toFixed(2) || '3.00'}</div>
            </div>
          </div>
        </div>

        {/* ZIP Codes List */}
        <div className="review-section">
          <h2 className="section-title">Target ZIP Codes</h2>
          <div className="zip-codes-list">
            {blastData.zipCodes.map((zip, index) => (
              <div key={index} className="zip-code-badge">
                {zip}
              </div>
            ))}
          </div>
        </div>

        <div className="blast-note">
          {blastData.deliveryOption === 'now'
            ? `Your postcards will be sent immediately to new movers in ${blastData.zipsWithData} ZIP code${blastData.zipsWithData !== 1 ? 's' : ''}`
            : `Your postcards will be sent on ${formatScheduledTime()} to new movers in ${blastData.zipsWithData} ZIP code${blastData.zipsWithData !== 1 ? 's' : ''}`}
        </div>

        <div className="form-footer">
          <div className="footer-actions" style={{width: '100%', justifyContent: 'space-between'}}>
            <span className="step-indicator">Step 5 of 5</span>
            <div className="final-actions">
              <motion.button
                className="launch-button"
                onClick={handleLaunchBlast}
                disabled={isLaunching}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(32, 178, 170, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isLaunching ? 'Launching...' : (
                  <>
                    <Send size={18} />
                    {blastData.deliveryOption === 'now' ? 'Launch Blast' : 'Schedule Blast'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .blast-content-wrapper {
          padding-bottom: 100px;
        }

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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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

        .success-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          text-align: center;
          padding: 40px;
        }

        .success-icon {
          color: #10b981;
          margin-bottom: 24px;
        }

        .success-title {
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 16px 0;
        }

        .success-subtitle {
          font-size: 16px;
          color: #718096;
          margin: 0 0 32px 0;
          max-width: 500px;
          line-height: 1.6;
        }

        .dashboard-button {
          padding: 14px 32px;
          background: #20B2AA;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .review-section {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .postcard-preview-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: #f7fafc;
          border-radius: 12px;
          min-height: 350px;
        }

        .postcard-preview-image {
          max-width: 100%;
          max-height: 500px;
          width: auto;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        .preview-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 200px;
          color: #cbd5e0;
          font-size: 16px;
          font-weight: 500;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .detail-price {
          color: #20B2AA;
          font-size: 20px;
        }

        .zip-codes-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .zip-code-badge {
          padding: 8px 16px;
          background: linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%);
          color: #065f46;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        .blast-note {
          background: #E6FFFA;
          border-left: 4px solid #20B2AA;
          padding: 16px 20px;
          border-radius: 8px;
          color: #234E52;
          font-size: 14px;
          line-height: 1.6;
          margin-top: 8px;
        }

        .launch-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #20B2AA 0%, #17a097 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(32, 178, 170, 0.25);
        }

        .launch-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          box-shadow: none;
        }

        .form-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          min-height: 72px;
          background-color: white;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
          z-index: 50;
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
        }

        .footer-actions {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .step-indicator {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
        }

        .final-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        @media (max-width: 768px) {
          .form-footer {
            padding: 0.875rem 1rem;
          }

          .footer-actions {
            flex-direction: column;
            gap: 0.875rem;
            align-items: flex-start;
          }

          .step-indicator {
            font-size: 0.8125rem;
          }

          .final-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .launch-button {
            flex: 1;
          }
        }
      `}</style>
    </ProcessLayout>
  );
};

export default BlastStep5;
