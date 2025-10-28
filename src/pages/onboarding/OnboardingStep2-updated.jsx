import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Grid, Layout, Palette, Eye } from 'lucide-react';
import './onboarding-updated.css';

const OnboardingStep2 = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [showProductDetails, setShowProductDetails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email', active: false, completed: true },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template', active: true, completed: false },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign', active: false, completed: false },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals', active: false, completed: false },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow', active: false, completed: false },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup', active: false, completed: false }
  ];

  // Load business data from previous step
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

  // Mock templates data
  const templates = [
    { 
      id: 1, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop'
    },
    { 
      id: 2, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop'
    },
    { 
      id: 3, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=600&fit=crop'
    },
    { 
      id: 4, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&h=600&fit=crop'
    },
    // Add more templates for pagination
    { 
      id: 5, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'
    },
    { 
      id: 6, 
      name: 'Template Name', 
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
      fullImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
    },
  ];

  const templatesPerPage = 4;
  const totalPages = Math.ceil(templates.length / templatesPerPage);

  // Simulate loading
  useEffect(() => {
    // Load business data from localStorage
    const step1Data = localStorage.getItem('onboardingStep1');
    if (step1Data) {
      const parsedData = JSON.parse(step1Data);
      setBusinessData(prevData => ({
        ...prevData,
        name: parsedData.businessName || prevData.name,
        website: parsedData.website || prevData.website
      }));
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  }, []);

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

  const handleSaveAsDraft = () => {
    console.log('Save as draft');
    setShowLeaveModal(false);
  };

  const handleDeleteChanges = () => {
    console.log('Delete changes');
    setShowLeaveModal(false);
    navigate('/onboarding/step1');
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-sidebar">
          <div className="logo-section">
            <div className="logo-placeholder">[Logo Placeholder]</div>
          </div>
          
          <div className="steps-list">
            {steps.map((step) => (
              <div 
                key={step.number} 
                className={`step-item ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {step.completed ? '' : step.number}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-subtitle">{step.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="onboarding-main">
          <div className="loading-overlay">
            <div className="loading-container">
              <div className="loading-content">
                <h2 className="loading-title">Let's style your postcard to match your brand</h2>
                <div className="loading-spinner"></div>
                <p className="loading-text">Blending your brand's colors and vibe...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-sidebar">
        <div className="logo-section">
          <div className="logo-placeholder">[Logo Placeholder]</div>
        </div>
        
        <div className="steps-list">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className={`step-item ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
            >
              <div className="step-number">
                {step.completed ? '' : step.number}
              </div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-subtitle">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="onboarding-main">
        <div className="main-content">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          
          <h1 className="main-title">Pick a Postcard Template</h1>
          
          <div className="template-section">
            <p className="preview-label">Preview of selected Template</p>
            
            <div className="template-preview-container">
              {selectedTemplate ? (
                <>
                  <button 
                    className="preview-nav prev" 
                    onClick={prevPreview}
                    disabled={currentPreviewIndex === 0}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className="postcard-preview">
                    <img 
                      src={selectedTemplate.fullImage} 
                      alt="Template preview" 
                      className="preview-image"
                    />
                    <div className="postcard-overlay">
                      <div className="postcard-header">
                        <div>
                          <div className="postcard-logo">{businessData.logo}</div>
                          <div className="postcard-business">{businessData.name}</div>
                        </div>
                        <div className="postcard-contact-info">
                          <div>{businessData.address1}</div>
                          <div>{businessData.address2}</div>
                          <div>{businessData.website}</div>
                        </div>
                      </div>
                      <h2 className="postcard-offer">{businessData.offer}</h2>
                      <p className="postcard-tagline">{businessData.tagline}</p>
                      <p className="postcard-cta">{businessData.callToAction}</p>
                      <p className="postcard-footer">{businessData.footer}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="preview-nav next" 
                    onClick={nextPreview}
                    disabled={currentPreviewIndex === templates.length - 1}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              ) : (
                <div className="empty-preview">
                  <div className="empty-preview-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 12L16 20L28 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3>No template selected</h3>
                  <p>Select a template from below to see a preview with your business information</p>
                </div>
              )}
            </div>
            
            <div className="product-details">
              <div 
                className="product-details-header"
                onClick={() => setShowProductDetails(!showProductDetails)}
              >
                <span className="product-details-title">Product Details</span>
                <svg 
                  className={`dropdown-arrow ${showProductDetails ? 'open' : ''}`}
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {showProductDetails && (
                <div className="product-details-content">
                  <ul>
                    <li>Dimension: 5.3" x 7.5"</li>
                    <li>Handwritten Text Length: Up to 500 characters included in base price (800 max)</li>
                    <li>Envelope: Handwritten Envelope</li>
                    <li>Stamp: Real Stamp</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="templates-grid">
              {getCurrentPageTemplates().map((template) => (
                <div 
                  key={template.id} 
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="template-image"
                  />
                  <div className="template-info">
                    <h3 className="template-name">{template.name}</h3>
                    <button 
                      className={`template-button ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                    >
                      {selectedTemplate?.id === template.id ? 'Selected' : 'Customize'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-footer">
          <p className="footer-message">Please select first the template before continuing to the next step</p>
          <div className="footer-actions">
            <span className="step-indicator">Step 2 of 6</span>
            <button 
              className="continue-button" 
              onClick={handleContinue}
              disabled={!selectedTemplate}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            className="leave-modal-overlay"
            onClick={() => setShowLeaveModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="leave-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h3>Leave this page?</h3>
              <p>You haven't finished setting up your campaign. Would you like to save your progress as a draft?</p>
              <div className="leave-modal-actions">
                <motion.button
                  className="modal-button delete"
                  onClick={handleDeleteChanges}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Changes
                </motion.button>
                <motion.button
                  className="modal-button save"
                  onClick={handleSaveAsDraft}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save as Draft
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingStep2;