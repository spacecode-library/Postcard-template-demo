import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import LoadingScreen from '../../components/onboarding/LoadingScreen';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';
import './onboarding-step2-redesign.css';

const OnboardingStep2 = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Onboarding steps configuration
  const steps = [
    { number: 1, title: 'URL Business', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  // Business data state
  const [businessData, setBusinessData] = useState({
    logo: 'Logo',
    name: 'Brew & Bean',
    offer: 'Free small coffee with your first pastry',
    tagline: '"New in Town? Let\'s caffeinate!"',
    callToAction: 'Bring this postcard in to redeem your discount',
    address1: '3900 Morse Rd, Columbus, OH',
    address2: '43219, United States',
    website: 'brewbean@company.com',
    footer: '"Perfect to start the day, Good Staff, Delicious"'
  });

  // Templates data
  const templates = [
    { id: 1, name: 'Fresh & Clean', templateId: 'fresh-clean', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop' },
    { id: 2, name: 'Modern Business', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop' },
    { id: 3, name: 'Creative Agency', image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=300&fit=crop' },
    { id: 4, name: 'Restaurant Special', image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400&h=300&fit=crop' },
    { id: 5, name: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop' },
    { id: 6, name: 'Professional Services', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop' },
    { id: 7, name: 'Event Promotion', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop' },
    { id: 8, name: 'Technology Solutions', image: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=400&h=300&fit=crop' },
    { id: 9, name: 'Retail Sale', image: 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=400&h=300&fit=crop' },
    { id: 10, name: 'Educational Services', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop' }
  ];

  const templatesPerPage = 4;
  const totalPages = Math.ceil(templates.length / templatesPerPage);

  // Load data on mount
  useEffect(() => {
    const step1Data = localStorage.getItem('onboardingStep1');
    if (step1Data) {
      const parsedData = JSON.parse(step1Data);
      setBusinessData(prevData => ({
        ...prevData,
        name: parsedData.businessName || prevData.name,
        website: parsedData.website || prevData.website
      }));
    }

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  }, []);

  // Handlers
  const getCurrentPageTemplates = () => {
    const startIndex = (currentPage - 1) * templatesPerPage;
    const endIndex = startIndex + templatesPerPage;
    return templates.slice(startIndex, endIndex);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentPreviewIndex(templates.findIndex(t => t.id === template.id));
  };

  const handleBack = () => {
    if (selectedTemplate) {
      setShowLeaveModal(true);
    } else {
      navigate('/onboarding/step1');
    }
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
      navigate('/onboarding/step3');
    }
  };

  const nextPreview = () => {
    if (currentPreviewIndex < templates.length - 1) {
      const nextIndex = currentPreviewIndex + 1;
      setCurrentPreviewIndex(nextIndex);
      setSelectedTemplate(templates[nextIndex]);
    }
  };

  const prevPreview = () => {
    if (currentPreviewIndex > 0) {
      const prevIndex = currentPreviewIndex - 1;
      setCurrentPreviewIndex(prevIndex);
      setSelectedTemplate(templates[prevIndex]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OnboardingLayout steps={steps} currentStep={2}>
        <LoadingScreen 
          title="Let's style your postcard to match your brand"
          subtitle="Blending your brand's colors and vibe..."
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout steps={steps} currentStep={2}>
      <div className="step2-main-content">
        <button className="step2-back-button" onClick={handleBack}>
          ← Back
        </button>
        
        <h1 className="step2-title">Pick a Postcard Template</h1>
        
        <p className="step2-preview-label">Preview of selected Template</p>
        
        {/* Preview Container */}
        <div className="step2-preview-container">
          {selectedTemplate ? (
            <>
              {/* Navigation Arrows */}
              <button 
                className="step2-nav-arrow prev"
                onClick={prevPreview}
                disabled={currentPreviewIndex === 0}
                aria-label="Previous template"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="step2-preview-wrapper">
                <div className="step2-preview-bg">
                  <img src={selectedTemplate.image} alt="Template background" />
                </div>
                
                <div className="step2-postcard-overlay">
                  <div className="step2-postcard-content">
                    <div className="step2-postcard-left">
                      <div className="step2-logo-badge">{businessData.logo}</div>
                      <h2 className="step2-business-name">{businessData.name}</h2>
                      <p className="step2-main-offer">{businessData.offer}</p>
                      <p className="step2-tagline">{businessData.tagline}</p>
                      <p className="step2-cta">{businessData.callToAction}</p>
                    </div>
                    
                    <div className="step2-postcard-right">
                      <p>{businessData.address1}</p>
                      <p>{businessData.address2}</p>
                      <p>{businessData.website}</p>
                    </div>
                  </div>
                  
                  <p className="step2-footer-quote">{businessData.footer}</p>
                </div>
              </div>
              
              <button 
                className="step2-nav-arrow next"
                onClick={nextPreview}
                disabled={currentPreviewIndex === templates.length - 1}
                aria-label="Next template"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          ) : (
            <div className="step2-empty-preview">
              <h3>It seems like you haven't selected any template</h3>
              <p>Click <strong>Try it</strong> one of below template to see the postcard visual</p>
            </div>
          )}
        </div>
        
        {/* Product Details Toggle */}
        <div className="step2-product-details">
          <button 
            className="step2-details-toggle"
            onClick={() => setShowProductDetails(!showProductDetails)}
          >
            <span>Product Details</span>
            <svg 
              className={`step2-chevron ${showProductDetails ? 'up' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showProductDetails && (
            <div className="step2-details-content">
              {/* Product details content would go here */}
            </div>
          )}
        </div>
        
        {/* Templates Grid */}
        <div className="step2-templates-grid">
          {getCurrentPageTemplates().map((template) => (
            <div
              key={template.id}
              className={`step2-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <img 
                src={template.image} 
                alt={template.name}
                className="step2-template-image"
              />
              <div className="step2-template-info">
                <h3 className="step2-template-name">{template.name}</h3>
                <button className="step2-template-button">
                  {selectedTemplate?.id === template.id ? 'Selected' : 'Customize'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="step2-pagination">
            <button 
              className="step2-pagination-button"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="step2-page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`step2-page-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button 
              className="step2-pagination-button"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <OnboardingFooter
        message="Please select first the template before continuing to the next step"
        currentStep={2}
        totalSteps={6}
        onContinue={handleContinue}
        continueDisabled={!selectedTemplate}
      />
      
      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="step2-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="step2-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="step2-modal-close"
              onClick={() => setShowLeaveModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Do you wanna leave this page?</h3>
            <p>If you go back now, you can save your progress as a draft or delete all changes you've made.</p>
            <div className="step2-modal-actions">
              <button 
                className="step2-modal-button delete"
                onClick={() => {
                  setShowLeaveModal(false);
                  navigate('/onboarding/step1');
                }}
              >
                Delete All Changes
              </button>
              <button 
                className="step2-modal-button save"
                onClick={() => {
                  // Save draft logic
                  localStorage.setItem('onboardingDraft', JSON.stringify({
                    step: 2,
                    selectedTemplate: selectedTemplate,
                    businessData: businessData,
                    savedAt: new Date().toISOString()
                  }));
                  setShowLeaveModal(false);
                  navigate('/onboarding/step1');
                }}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default OnboardingStep2;