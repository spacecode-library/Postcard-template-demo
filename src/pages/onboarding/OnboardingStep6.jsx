import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import { formatPrice } from '../../utils/pricing';
import campaignService from '../../supabase/api/campaignService';
import { paymentService } from '../../supabase/api/paymentService';
import toast from 'react-hot-toast';

const OnboardingStep6 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLaunched, setIsLaunched] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [targetingData, setTargetingData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isActivating, setIsActivating] = useState(false);

  // Load data from localStorage and sessionStorage
  useEffect(() => {
    // Load selected template
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(JSON.parse(savedTemplate));
    }

    // Load targeting data (includes pricing)
    const savedTargeting = sessionStorage.getItem('targetingData');
    if (savedTargeting) {
      setTargetingData(JSON.parse(savedTargeting));
    }

    // Load company data
    const savedCompanyData = localStorage.getItem('onboardingStep1');
    if (savedCompanyData) {
      setCompanyData(JSON.parse(savedCompanyData));
    }
  }, []);

  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  const handleBack = () => {
    navigate('/onboarding/step5');
  };

  const handleActivate = async () => {
    if (!targetingData || !targetingData.zipsWithData || targetingData.zipsWithData === 0) {
      toast.error('No ZIP codes with data found. Please go back and validate ZIP codes.');
      return;
    }

    setIsActivating(true);

    try {
      toast.loading('Creating your campaign...', { id: 'activate-campaign' });

      // Prepare campaign data
      const campaignData = {
        name: `${companyData?.companyData?.name || 'Business'} Campaign - ${new Date().toLocaleDateString()}`,
        status: 'active', // Start as active since payment will be processed
        template_id: selectedTemplate?.id || null,
        template_name: selectedTemplate?.name || null,
        postcard_preview_url: selectedTemplate?.preview || null,
        targeting_type: targetingData.option || 'zip_codes',
        target_zip_codes: targetingData.zipCodes || [],
        validated_zips: targetingData.validatedZips || [],
        zips_with_data: targetingData.zipsWithData || 0,
        postcards_sent: 0, // Will be updated when postcards are actually sent
        price_per_postcard: targetingData.flatRate || 3.00,
        payment_status: 'pending' // Will be updated after payment
      };

      // Create campaign in database
      const campaignResult = await campaignService.createCampaign(campaignData);

      if (!campaignResult.success) {
        throw new Error('Failed to create campaign');
      }

      const campaign = campaignResult.campaign;
      console.log('Campaign created:', campaign);

      toast.success('Campaign setup complete!', { id: 'activate-campaign' });

      // Note: Payment will be processed when postcards are actually sent
      setIsLaunched(true);

    } catch (error) {
      console.error('Error activating campaign:', error);
      toast.error(`Failed to activate campaign: ${error.error || error.message}`, {
        id: 'activate-campaign',
        duration: 5000
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handlePayLater = async () => {
    if (!targetingData || !targetingData.zipsWithData || targetingData.zipsWithData === 0) {
      toast.error('No ZIP codes with data found. Please go back and validate ZIP codes.');
      return;
    }

    try {
      toast.loading('Saving campaign as draft...', { id: 'pay-later' });

      // Create campaign with draft status
      const campaignData = {
        name: `${companyData?.companyData?.name || 'Business'} Campaign - ${new Date().toLocaleDateString()}`,
        status: 'draft',
        template_id: selectedTemplate?.id || null,
        template_name: selectedTemplate?.name || null,
        postcard_preview_url: selectedTemplate?.preview || null,
        targeting_type: targetingData.option || 'zip_codes',
        target_zip_codes: targetingData.zipCodes || [],
        validated_zips: targetingData.validatedZips || [],
        zips_with_data: targetingData.zipsWithData || 0,
        postcards_sent: 0,
        price_per_postcard: targetingData.flatRate || 3.00,
        payment_status: 'pending'
      };

      const result = await campaignService.createCampaign(campaignData);

      if (result.success) {
        toast.success('Campaign saved as draft!', { id: 'pay-later' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save campaign', { id: 'pay-later' });
    }
  };

  const handleGoToDashboard = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  if (isLaunched) {
    return (
      <OnboardingLayout steps={steps} currentStep={6}>
        <div className="success-content">
          <h1 className="success-title">Campaign successfully launched!</h1>
          <button className="dashboard-button" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout steps={steps} currentStep={6}>
        <div className="main-content launch-content">
          <button className="back-button" onClick={handleBack}>
            <ChevronLeft size={18} />
            Back
          </button>
          
          <h1 className="main-title">Launch Campaign</h1>
          
          {/* Post Card Section */}
          <div className="launch-section">
            <h2 className="launch-section-title">Post Card</h2>
            <div className="postcard-final-preview">
              {selectedTemplate?.preview ? (
                <img
                  src={selectedTemplate.preview}
                  alt={`${selectedTemplate.name} template preview`}
                  className="postcard-preview-image"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#718096',
                  fontSize: '1rem'
                }}>
                  No template preview available
                </div>
              )}
            </div>
          </div>

          {/* Package Section */}
          <div className="launch-section">
            <h2 className="launch-section-title">Package</h2>
            <div className="package-details">
              <div className="package-row">
                <div className="package-label">Template</div>
                <div className="package-value">{selectedTemplate?.name || 'Custom Template'}</div>
              </div>
              <div className="package-row">
                <div className="package-label">Business</div>
                <div className="package-value">{companyData?.companyData?.name || 'Your Business'}</div>
              </div>
              <div className="package-row">
                <div className="package-label">Targeting</div>
                <div className="package-value">
                  {targetingData?.totalZipCodes ? `${targetingData.totalZipCodes} ZIP Code${targetingData.totalZipCodes !== 1 ? 's' : ''}` : 'ZIP Code Targeting'}
                </div>
              </div>
              <div className="package-row">
                <div className="package-label">ZIP Codes with Data</div>
                <div className="package-value">{targetingData?.zipsWithData || 0} ZIP Code{targetingData?.zipsWithData !== 1 ? 's' : ''}</div>
              </div>
              <div className="package-row">
                <div className="package-label">Rate per Postcard</div>
                <div className="package-value package-price">${targetingData?.flatRate?.toFixed(2) || '3.00'}</div>
              </div>
            </div>
          </div>

          <div className="campaign-note">
            {targetingData?.zipsWithData > 0
              ? `Your postcards will be sent to new movers in ${targetingData.zipsWithData} ZIP code${targetingData.zipsWithData !== 1 ? 's' : ''} at $${targetingData?.flatRate?.toFixed(2) || '3.00'} per postcard`
              : 'No targeting data available'}
          </div>
        </div>
        
        <div className="form-footer">
          <div className="footer-actions" style={{width: '100%', justifyContent: 'space-between'}}>
            <span className="step-indicator">Step 6 of 6</span>
            <div className="final-actions">
              <button
                className="pay-later-button"
                onClick={handlePayLater}
                disabled={isActivating}
              >
                Pay Later
              </button>
              <button
                className="activate-button"
                onClick={handleActivate}
                disabled={isActivating}
              >
                {isActivating ? 'Processing...' : 'Activate'}
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .package-breakdown {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: -8px;
          }

          .package-breakdown .package-value {
            font-size: 0.875rem;
            color: #718096;
            font-weight: normal;
          }

          .campaign-note {
            background: #E6FFFA;
            border-left: 4px solid #20B2AA;
            padding: 12px 16px;
            border-radius: 4px;
            color: #234E52;
            font-size: 0.875rem;
            margin-top: 16px;
          }
        `}</style>
    </OnboardingLayout>
  );
};

export default OnboardingStep6;