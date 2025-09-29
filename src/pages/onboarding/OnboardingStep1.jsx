import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';

const OnboardingStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    website: '',
    businessCategory: ''
  });

  const steps = [
    { number: 1, title: 'URL Business', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  const businessCategories = [
    'Restaurant & Food Service',
    'Retail & E-commerce',
    'Real Estate',
    'Home Services',
    'Health & Wellness',
    'Professional Services',
    'Automotive',
    'Education',
    'Entertainment & Events',
    'Non-Profit',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      // Save form data to localStorage for now
      localStorage.setItem('onboardingStep1', JSON.stringify(formData));
      navigate('/onboarding/step2');
    }
  };

  const isFormValid = () => {
    return formData.website && 
           formData.businessCategory;
  };

  return (
    <OnboardingLayout steps={steps} currentStep={1}>
      <div className="main-content">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        
        <h1 className="main-title">What's your business website URL?</h1>
        <p className="main-subtitle">We'll use your website to get your business details with Brandfetch and suggest the best postcard template for your business.</p>
        
        <form className="onboarding-form" onSubmit={handleContinue}>
          <div className="form-group">
            <label htmlFor="website">Website URL *</label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://yourcompany.com"
              value={formData.website}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="businessCategory">Business Category *</label>
            <select
              id="businessCategory"
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              required
            >
              <option value="">Please select a category</option>
              {businessCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </form>
        
        <div className="footer-section">
          <div className="footer-text">
            Enter your website URL and select your business category to continue
          </div>
          <div className="footer-actions">
            <span className="step-indicator">Step 1 of 6</span>
            <button 
              className="continue-button"
              onClick={handleContinue}
              disabled={!isFormValid()}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep1;