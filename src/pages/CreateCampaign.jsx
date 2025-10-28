import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import CampaignSteps from '../components/campaign/CampaignSteps';
import Step1URL from '../components/campaign/Step1URL';
import Step2Templates from '../components/campaign/Step2Templates';
import Step3Editor from '../components/campaign/Step3Editor';
import Step4Targeting from '../components/campaign/Step4Targeting';
import Step6Launch from '../components/campaign/Step6Launch';
import './CreateCampaign.css';

const steps = [
  { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
  { number: 2, title: 'Postcard Template', subtitle: 'Choose and Setup' },
  { number: 3, title: 'Postcard Editor', subtitle: 'Customize campaign' },
  { number: 4, title: 'Targeting & Budget', subtitle: 'Choose package' },
  { number: 5, title: 'Launch Campaign', subtitle: 'Finish the setup' }
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = () => {
    // Simulate launching campaign
    setIsLoading(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Create Campaign' }
  ];

  return (
    <DashboardLayout>
      <div className="create-campaign-page">
        <Breadcrumb items={breadcrumbItems} />
        <CampaignSteps steps={steps} currentStep={currentStep} />
        
        <div className="campaign-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h2 className="loading-title">Launching your campaign...</h2>
              <p className="loading-subtitle">This will take just a moment</p>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <Step1URL
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onContinue={handleNext}
                />
              )}
              
              {currentStep === 2 && (
                <Step2Templates
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}
              
              {currentStep === 3 && (
                <Step3Editor
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}
              
              {currentStep === 4 && (
                <Step4Targeting
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onContinue={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 5 && (
                <Step6Launch
                  formData={formData}
                  onLaunch={handleLaunch}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </div>
        
        {currentStep === 1 && (
          <div className="campaign-footer">
            <div className="footer-message">
              We'll use this to create a customized postcard for your business
            </div>
            <div className="footer-actions">
              <span className="step-indicator">Step {currentStep} of 5</span>
              <div className="footer-buttons">
                <button className="campaign-button save-draft-button">
                  Save as Draft
                </button>
                <button
                  className="campaign-button continue-button"
                  onClick={handleNext}
                  disabled={!formData.website}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;