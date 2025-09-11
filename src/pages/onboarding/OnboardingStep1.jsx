import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';

const OnboardingStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
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
    return formData.firstName && 
           formData.lastName && 
           formData.email &&
           formData.businessName && 
           formData.website && 
           formData.businessCategory;
  };

  return (
    <OnboardingLayout steps={steps} currentStep={1}>
      <div className="main-content">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        
        <h1 className="main-title">What's your business website URL?</h1>
        <p className="main-subtitle">We will generate some postcard ideas with your URL.</p>
        
        <form className="onboarding-form" onSubmit={handleContinue}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="website">Website *</label>
              <input
                type="url"
                id="website"
                name="website"
                placeholder="company.com"
                value={formData.website}
                onChange={handleChange}
                required
              />
            </div>
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
            Please select first the template before continuing to the next step
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