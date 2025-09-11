import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';

const OnboardingStep5 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    cardNumber: '',
    expiration: '',
    cvc: ''
  });

  const steps = [
    { number: 1, title: 'URL Business', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    // Format expiration as MM / YY
    if (name === 'expiration') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + ' / ' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 7) formattedValue = formattedValue.slice(0, 7);
    }

    // Limit CVC to 3 digits
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleBack = () => {
    navigate('/onboarding/step4');
  };

  const handleSaveAndContinue = () => {
    if (canContinue()) {
      navigate('/onboarding/step6');
    }
  };

  const canContinue = () => {
    return formData.email && 
           formData.cardNumber.replace(/\s/g, '').length >= 16 && 
           formData.expiration.length === 7 && 
           formData.cvc.length === 3;
  };

  return (
    <OnboardingLayout steps={steps} currentStep={5}>
        <div className="main-content">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          
          <h1 className="main-title">Payment Setup</h1>
          
          <div className="payment-form">
            {/* Billing Information */}
            <div className="payment-section">
              <h3 className="section-title">Billing Information</h3>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Input your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-section">
              <h3 className="section-title">Payment Method</h3>
              <div className={`payment-method-card ${formData.cardNumber ? 'selected' : ''}`}>
                <div className="payment-method-header">
                  <div className="stripe-logo">
                    <svg width="40" height="17" viewBox="0 0 40 17" fill="none">
                      <path d="M40 8.5c0 4.694-3.806 8.5-8.5 8.5s-8.5-3.806-8.5-8.5S26.806 0 31.5 0 40 3.806 40 8.5z" fill="#6772E5"/>
                      <path d="M33.25 7.125c-.125-.125-.375-.125-.5 0l-2.25 2.25-1-1c-.125-.125-.375-.125-.5 0-.125.125-.125.375 0 .5l1.25 1.25c.125.125.375.125.5 0l2.5-2.5c.125-.125.125-.375 0-.5z" fill="white"/>
                    </svg>
                    <span>stripe</span>
                  </div>
                  <div className="payment-method-info">
                    <div>Stripe ending in 1234</div>
                    <div className="expiry">Expiry 06/2025</div>
                  </div>
                  {formData.cardNumber && (
                    <svg className="checkmark-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#22c997"/>
                      <path d="m6 10 2 2 6-6" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </div>
                <div className="payment-method-actions">
                  <span className="set-default">Set as default</span>
                  <button className="edit-button">Edit</button>
                </div>
              </div>
            </div>

            {/* Card Information */}
            <div className="payment-section">
              <h3 className="section-title">Card Information</h3>
              
              <div className="form-group card-number-group">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 1234 1234 1234"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="card-number-input"
                />
                <div className="card-logos">
                  <img src="data:image/svg+xml,%3Csvg width='24' height='16' viewBox='0 0 24 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='16' rx='2' fill='%231A1F36'/%3E%3Cpath d='M8.5 4.5h7v7h-7v-7z' fill='%23FF5F00'/%3E%3Cpath d='M8.5 8c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5z' fill='%23EB001B'/%3E%3Cpath d='M12 4.5c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5' fill='%23F79E1B'/%3E%3C/svg%3E" alt="Mastercard" />
                  <img src="data:image/svg+xml,%3Csvg width='24' height='16' viewBox='0 0 24 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='16' rx='2' fill='%23001C64'/%3E%3Cpath d='M10.5 2.5L8 6.5h3.5L9 10.5l4.5-4.5H10l2.5-3.5h-2z' fill='%23FFB511'/%3E%3C/svg%3E" alt="Visa" />
                  <div className="stripe-card-logo">stripe</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiration</label>
                  <input
                    type="text"
                    name="expiration"
                    placeholder="MM / YY"
                    value={formData.expiration}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={formData.cvc}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="privacy-notice">
                By clicking "Pay" you agree that you have read Flash Account's Privacy Policy and Terms of Service.
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-footer">
          <div className="footer-actions" style={{width: '100%', justifyContent: 'space-between'}}>
            <span className="step-indicator">Step 5 of 6</span>
            <button 
              className="continue-button" 
              onClick={handleSaveAndContinue}
              disabled={!canContinue()}
              style={{minWidth: '150px'}}
            >
              Save & Continue
            </button>
          </div>
        </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep5;