import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Breadcrumb from '../components/common/Breadcrumb';
import CampaignSteps from '../components/campaign/CampaignSteps';
import './CreateBlast.css';

const steps = [
  { number: 1, title: 'Choose Template', subtitle: 'Customize Postcard' },
  { number: 2, title: 'Customize Postcard', subtitle: 'Select Audience' },
  { number: 3, title: 'Select Audience', subtitle: 'Schedule & Send' },
  { number: 4, title: 'Schedule & Send', subtitle: 'Review & Confirm' },
  { number: 5, title: 'Review & Confirm', subtitle: 'Finish the setup' }
];

const quickTemplates = [
  { id: 1, title: 'Sale Announcement', description: 'Promote special offers', icon: '🏷️' },
  { id: 2, title: 'Event Invitation', description: 'Invite to events', icon: '🎉' },
  { id: 3, title: 'New Opening', description: 'Grand opening news', icon: '🎊' },
  { id: 4, title: 'Holiday Greetings', description: 'Seasonal messages', icon: '🎄' },
  { id: 5, title: 'Product Launch', description: 'New arrivals', icon: '🚀' },
  { id: 6, title: 'Thank You', description: 'Customer appreciation', icon: '💝' }
];

const CreateBlast = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    templateId: null,
    headline: '',
    message: '',
    audienceType: null,
    audienceCount: 0
  });

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

  const handleSelectTemplate = (templateId) => {
    setFormData(prev => ({ ...prev, templateId }));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendBlast = () => {
    // Simulate sending blast
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Create Blast' }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="blast-step-content">
            <h1 className="step-main-title">Choose a quick template</h1>
            <div className="quick-templates">
              {quickTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`quick-template-card ${formData.templateId === template.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <h3 className="template-title">{template.title}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="blast-step-content">
            <h1 className="step-main-title">Quick edit your message</h1>
            <div className="quick-editor">
              <div className="editor-preview-small">
                <h2>{formData.headline || 'Your Headline Here'}</h2>
                <p>{formData.message || 'Your message will appear here'}</p>
              </div>
              <form className="blast-form">
                <div className="form-group">
                  <label className="form-label">
                    Headline <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => handleFieldChange('headline', e.target.value)}
                    placeholder="Enter your headline"
                    className="campaign-input"
                    maxLength="50"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    placeholder="Enter your message"
                    className="campaign-textarea"
                    rows="4"
                    maxLength="150"
                  />
                </div>
              </form>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="blast-step-content">
            <h1 className="step-main-title">Select your audience</h1>
            <div className="audience-options">
              <div
                className={`audience-option ${formData.audienceType === 'small' ? 'selected' : ''}`}
                onClick={() => {
                  handleFieldChange('audienceType', 'small');
                  handleFieldChange('audienceCount', 1000);
                }}
              >
                <div className="audience-count">1,000</div>
                <div className="audience-label">Nearby customers</div>
              </div>
              <div
                className={`audience-option ${formData.audienceType === 'medium' ? 'selected' : ''}`}
                onClick={() => {
                  handleFieldChange('audienceType', 'medium');
                  handleFieldChange('audienceCount', 2500);
                }}
              >
                <div className="audience-count">2,500</div>
                <div className="audience-label">Local area</div>
              </div>
              <div
                className={`audience-option ${formData.audienceType === 'large' ? 'selected' : ''}`}
                onClick={() => {
                  handleFieldChange('audienceType', 'large');
                  handleFieldChange('audienceCount', 5000);
                }}
              >
                <div className="audience-count">5,000</div>
                <div className="audience-label">Wide reach</div>
              </div>
            </div>
            <div className="reach-estimate">
              <div className="reach-stats">
                <div className="stat-item">
                  <span className="stat-label">Estimated Cost:</span>
                  <span className="stat-value">${(formData.audienceCount * 0.50).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="blast-step-content">
            <h1 className="step-main-title">Review your blast</h1>
            <div className="blast-review">
              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Template</span>
                  <span className="review-value">
                    {quickTemplates.find(t => t.id === formData.templateId)?.title || 'Not selected'}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Audience Size</span>
                  <span className="review-value">{formData.audienceCount.toLocaleString()} households</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Headline</span>
                  <span className="review-value">{formData.headline || 'Not provided'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Total Cost</span>
                  <span className="review-value">${(formData.audienceCount * 0.50).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="blast-step-content">
            <div className="blast-launch">
              <div className="launch-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M30 16L4 2V12L16 16L4 20V30L30 16Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Ready to send your blast!</h3>
              <p>Your postcards will be printed and mailed within 24 hours to reach {formData.audienceCount.toLocaleString()} households in your selected area.</p>
              <button className="blast-button" onClick={handleSendBlast}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10L18 2V8L10 10L18 12V18L2 10Z" fill="currentColor"/>
                </svg>
                Send Blast Now
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="create-blast-page">
        <Breadcrumb items={breadcrumbItems} />
        <CampaignSteps steps={steps} currentStep={currentStep} />
        
        <div className="blast-content">
          {renderStep()}
        </div>
        
        <div className="campaign-footer">
          <div className="footer-message">
            {currentStep === 1 && 'Select a template to get started quickly'}
            {currentStep === 2 && 'Customize your message for maximum impact'}
            {currentStep === 3 && 'Choose how many customers to reach'}
            {currentStep === 4 && 'Review all details before sending'}
            {currentStep === 5 && 'Your blast is ready to launch'}
          </div>
          <div className="footer-actions">
            <span className="step-indicator">Step {currentStep} of 5</span>
            <div className="footer-buttons">
              {currentStep > 1 && currentStep < 5 && (
                <button className="campaign-button back-button" onClick={handleBack}>
                  Back
                </button>
              )}
              {currentStep < 5 && (
                <button 
                  className="campaign-button continue-button" 
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.templateId) ||
                    (currentStep === 2 && (!formData.headline || !formData.message)) ||
                    (currentStep === 3 && !formData.audienceType)
                  }
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateBlast;