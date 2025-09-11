import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';

const OnboardingStep6 = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLaunched, setIsLaunched] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Load selected template from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(JSON.parse(savedTemplate));
    }
  }, []);

  const steps = [
    { number: 1, title: 'URL Business', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  const handleBack = () => {
    navigate('/onboarding/step5');
  };

  const handleActivate = () => {
    setIsLaunched(true);
  };

  const handlePayLater = () => {
    // Handle pay later functionality
    console.log('Pay Later clicked');
  };

  const handleGoToDashboard = () => {
    // Mark onboarding as completed
    const updatedUser = { ...user, onboardingCompleted: true };
    updateUser(updatedUser);
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
            ← Back
          </button>
          
          <h1 className="main-title">Launch Campaign</h1>
          
          {/* Post Card Section */}
          <div className="launch-section">
            <h2 className="launch-section-title">Post Card</h2>
            <div className="postcard-final-preview">
              <div className="postcard-background">
                <img 
                  src={selectedTemplate?.image || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop"} 
                  alt="Postcard background" 
                  className="postcard-bg"
                />
              </div>
              <div className="postcard-content-final">
                <div className="postcard-main-content">
                  <div className="postcard-logo-final">Logo</div>
                  <h3 className="postcard-business-final">Brew & Bean</h3>
                  <h4 className="postcard-offer-final">Free small coffee with your first pastry</h4>
                  <p className="postcard-tagline-final">"New in Town? Let's caffeinate!"</p>
                  <p className="postcard-cta-final">Bring this postcard in to redeem your discount</p>
                </div>
                <div className="postcard-contact-final">
                  <div>3900 Morse Rd, Columbus, OH</div>
                  <div>43219, United States</div>
                  <div>brewbean@company.com</div>
                </div>
                <div className="postcard-footer-final">
                  "Perfect to start the day, Good Staff, Delicious"
                </div>
              </div>
            </div>
          </div>

          {/* Package Section */}
          <div className="launch-section">
            <h2 className="launch-section-title">Package</h2>
            <div className="package-details">
              <div className="package-row">
                <div className="package-label">Post Card</div>
                <div className="package-value">Post Card Template 1</div>
              </div>
              <div className="package-row">
                <div className="package-label">Address</div>
                <div className="package-value">Columbus, OH</div>
              </div>
              <div className="package-row package-cost">
                <div className="package-label">Cost - Radius (0-199)</div>
                <div className="package-value package-price">$ 3,00</div>
              </div>
            </div>
          </div>

          <div className="campaign-note">
            We will send your postcard to you for $2
          </div>
        </div>
        
        <div className="form-footer">
          <div className="footer-actions" style={{width: '100%', justifyContent: 'space-between'}}>
            <span className="step-indicator">Step 6 of 6</span>
            <div className="final-actions">
              <button className="pay-later-button" onClick={handlePayLater}>
                Pay Later
              </button>
              <button className="activate-button" onClick={handleActivate}>
                Activate
              </button>
            </div>
          </div>
        </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep6;