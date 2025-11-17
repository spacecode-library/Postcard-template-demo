import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import LoadingScreen from '../../components/onboarding/LoadingScreen';
import TemplateCardSkeleton from '../../components/common/TemplateCardSkeleton';
import supabaseCompanyService from '../../supabase/api/companyService';
import campaignService from '../../supabase/api/campaignService';
import onboardingService from '../../supabase/api/onboardingService';
import toast from 'react-hot-toast';
import './onboarding-step2-redesign.css';

const OnboardingStep2Enhanced = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [error, setError] = useState(null);

  // Onboarding steps configuration
  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
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
    footer: '"Perfect to start the day, Good Staff, Delicious"',
    colors: null  // Will be populated from Supabase
  });

  const templatesPerPage = 4;
  const totalPages = Math.ceil(templates.length / templatesPerPage);

  // Load templates from JSON and business data on mount
  useEffect(() => {
    const loadTemplatesAndData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load business data from Step 1 localStorage
        const step1Data = localStorage.getItem('onboardingStep1');

        // VALIDATE: campaignId must exist from Step 1
        if (!step1Data) {
          toast.error('Please complete Step 1 first');
          navigate('/onboarding/step1');
          return;
        }

        const parsedData = JSON.parse(step1Data);

        if (!parsedData.campaignId) {
          toast.error('Campaign not found. Please restart from Step 1.');
          navigate('/onboarding/step1');
          return;
        }

        console.log('✅ Campaign ID validated:', parsedData.campaignId);

        setBusinessData(prevData => ({
          ...prevData,
          name: parsedData.companyData?.name || 'Your Business',
          website: parsedData.website || prevData.website
        }));

        // Load brand colors from Supabase
        try {
          const companyData = await supabaseCompanyService.getCompanyInfo();
          if (companyData) {
            console.log('Loaded company data from Supabase:', companyData);

            // Parse color_palette if it's a string
            let colorPalette = companyData.color_palette;
            if (typeof colorPalette === 'string') {
              try {
                colorPalette = JSON.parse(colorPalette);
              } catch (e) {
                console.warn('Could not parse color_palette:', e);
                colorPalette = [];
              }
            }

            setBusinessData(prevData => ({
              ...prevData,
              name: companyData.name || prevData.name,
              colors: {
                primary: companyData.primary_color,
                secondary: companyData.secondary_color,
                palette: Array.isArray(colorPalette) ? colorPalette : []
              },
              logo: companyData.logo_url
            }));
          }
        } catch (companyError) {
          console.warn('Could not load company data:', companyError);
          // Continue with default values
        }

        // Load templates from templates.json (with cache busting)
        console.log('Loading templates from templates.json...');
        const cacheBuster = Date.now();
        const response = await fetch(`/templates.json?v=${cacheBuster}`);
        if (!response.ok) {
          throw new Error(`Failed to load templates: ${response.statusText}`);
        }
        
        const allTemplates = await response.json();
        console.log('Loaded templates:', allTemplates);
        console.log('Template preview paths:', allTemplates.map(t => ({ name: t.name, preview: t.preview })));
        
        // Filter only available templates with PSD files (exclude 2-sided)
        const availableTemplates = allTemplates.filter(template =>
          template.available &&
          template.psdFile &&
          template.psdFile.endsWith('.psd') &&
          template.sides !== 2  // Only show 1-sided templates
        );

        console.log(`Found ${availableTemplates.length} available 1-sided PSD templates`);
        
        if (availableTemplates.length === 0) {
          throw new Error('No available PSD templates found');
        }
        
        setTemplates(availableTemplates);
        
        // Simulate loading time for smooth UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Failed to load templates:', err);
        setError(err.message || 'Failed to load templates. Please refresh the page.');
        setIsLoading(false);
      }
    };

    loadTemplatesAndData();
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

  const handleContinue = async () => {
    if (selectedTemplate) {
      try {
        // Update campaign with template selection
        const step1Data = JSON.parse(localStorage.getItem('onboardingStep1'));
        if (step1Data?.campaignId) {
          toast.loading('Saving template selection...', { id: 'template-save' });

          await campaignService.updateCampaign(step1Data.campaignId, {
            template_id: selectedTemplate.id,
            template_name: selectedTemplate.name
          });

          toast.success('Template saved!', { id: 'template-save' });
        }

        // Store the enhanced template data for Step 3
        localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));

        // Mark step 2 as complete
        await onboardingService.markStepComplete(2);

        navigate('/onboarding/step3');
      } catch (error) {
        console.error('Error saving template:', error);
        toast.error('Failed to save template selection');
      }
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

  const getTemplatePreviewUrl = (template) => {
    // Use generated PNG preview if available, fallback to a placeholder
    if (template.preview) {
      console.log(`Loading preview for ${template.name}: ${template.preview}`);
      return template.preview;
    }
    
    // Use a subtle placeholder that indicates preview generation is needed
    console.log(`No preview available for ${template.name}, using placeholder`);
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${template.primaryColor || '#f7fafc'}"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">
          ${template.name}
        </text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#ffffff80">
          Loading Preview...
        </text>
      </svg>
    `)}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <OnboardingLayout
        steps={steps}
        currentStep={2}
        showFooter={false}
      >
        <LoadingScreen
          title="Loading your postcard templates..."
          subtitle="Setting up professional PSD templates with full editing capabilities..."
        />
      </OnboardingLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <OnboardingLayout
        steps={steps}
        currentStep={2}
        showFooter={false}
      >
        <div className="step2-error-state">
          <div className="error-icon">⚠️</div>
          <h2>Unable to load templates</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh Page
            </button>
            <button onClick={handleBack} className="btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={2}
      footerMessage={
        selectedTemplate
          ? `Continue with ${selectedTemplate.name} template`
          : "Please select a template before continuing to the editor"
      }
      onContinue={handleContinue}
      continueDisabled={!selectedTemplate}
    >
      <div className="step2-main-content">
        <button className="step2-back-button" onClick={handleBack}>
          ← Back
        </button>
        
        <h1 className="step2-title">Pick a Postcard Template</h1>
        <p className="step2-subtitle">
          Choose from {templates.length} professional PSD templates with real preview images and full editing capabilities
        </p>

        {/* Brand Colors Indicator */}
        {businessData.colors && businessData.colors.palette && businessData.colors.palette.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#F7FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4A5568' }}>
              🎨 Your Brand Colors:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {businessData.colors.palette.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: color.hex || color,
                    borderRadius: '6px',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                  title={color.hex || color}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: 'auto' }}>
              These will be applied to your template
            </span>
          </div>
        )}
        
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
                  <img 
                    src={getTemplatePreviewUrl(selectedTemplate)} 
                    alt={`${selectedTemplate.name} template preview`}
                    onError={(e) => {
                      console.warn(`Failed to load preview image for ${selectedTemplate.name}:`, e.target.src);
                      // Fallback to colored placeholder
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="${selectedTemplate.primaryColor || '#f7fafc'}"/>
                          <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">
                            ${selectedTemplate.name}
                          </text>
                          <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#ffffff80">
                            Image Not Available
                          </text>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                
                {/* Template info overlay */}
                <div className="step2-template-info-overlay">
                  <div className="template-name">{selectedTemplate.name}</div>
                  <div className="template-features">
                    {selectedTemplate.features && selectedTemplate.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-badge">{feature}</span>
                    ))}
                  </div>
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
              <h3>Select a template to see preview</h3>
              <p>Click <strong>Select</strong> on any template below to see how your postcard will look</p>
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
              <ul>
                <li>Dimension: 5.3" x 7.5" (Professional Postcard Size)</li>
                <li>Format: High-resolution PSD templates with editable elements</li>
                <li>Editing: Advanced IMG.LY editor with Simple and Professional modes</li>
                <li>Export: PDF and PNG formats available</li>
                <li>Elements: Text, images, colors, and layout fully customizable</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Templates Grid */}
        <div className="step2-templates-grid">
          {isLoading ? (
            // Show skeleton loaders during loading
            Array.from({ length: templatesPerPage }).map((_, index) => (
              <TemplateCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            // Show actual template cards when loaded
            getCurrentPageTemplates().map((template) => (
              <div
                key={template.id}
                className={`step2-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <img
                  src={getTemplatePreviewUrl(template)}
                  alt={template.name}
                  className="step2-template-image"
                  onError={(e) => {
                    console.warn(`Failed to load template image for ${template.name}:`, e.target.src);
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="${template.primaryColor || '#f7fafc'}"/>
                        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white">
                          ${template.name}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
                <div className="step2-template-info">
                  <h3 className="step2-template-name">{template.name}</h3>
                  <div className="step2-template-meta">
                    {template.sides === 2 && (
                      <span className="double-sided-badge">2-Sided</span>
                    )}
                  </div>
                  <button className="step2-template-button">
                    {selectedTemplate?.id === template.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))
          )}
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

        {/* Debug info for PSD preview generation */}
        <div className="step2-debug-info">
          <details>
            <summary>🎨 Generate Real PSD Previews (Developer)</summary>
            <div className="debug-content">
              <p>To generate REAL JPG previews from actual PSD files:</p>
              <ol>
                <li>Open browser console (F12)</li>
                <li><strong>Run: <code>generateRealPreviews()</code></strong> ⭐</li>
                <li>Save all downloaded JPG files to <code>public/template-previews/</code></li>
                <li>Templates.json is already configured for JPG files</li>
                <li>Refresh this page to see REAL PSD content previews!</li>
              </ol>
              <p><strong>DONE:</strong> Real PNG preview images have been generated from PSD files!</p>
              <p><strong>Current Status:</strong></p>
              <ul>
                {templates.map(template => (
                  <li key={template.id}>
                    {template.name} → {template.preview ? '✅ PNG Preview Available' : '❌ No Preview'}
                    {template.psdFile ? ' 📁 PSD Ready' : ' ❌ No PSD'}
                  </li>
                ))}
              </ul>
              <p><strong>Templates with PNG previews:</strong> {templates.filter(t => t.preview && t.preview.includes('.png')).length}/{templates.length}</p>
            </div>
          </details>
        </div>
      </div>

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

      <style jsx>{`
        .step2-error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 40px;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .step2-error-state h2 {
          color: #e53e3e;
          margin-bottom: 10px;
        }

        .step2-error-state p {
          color: #718096;
          margin-bottom: 30px;
          max-width: 500px;
        }

        .error-actions {
          display: flex;
          gap: 15px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary {
          background-color: #20B2AA;
          color: white;
        }

        .btn-secondary {
          background-color: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .step2-subtitle {
          color: #718096;
          margin-bottom: 20px;
          font-size: 16px;
        }

        .step2-template-info-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
        }

        .template-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .template-features {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .feature-badge {
          background: rgba(255,255,255,0.2);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
        }


        .step2-template-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: #718096;
        }

        .quality-badge, .double-sided-badge {
          background: #20B2AA;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
        }

        .double-sided-badge {
          background: #ed8936;
        }

        .step2-debug-info {
          margin-top: 40px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          font-size: 14px;
        }

        .debug-content {
          margin-top: 10px;
        }

        .debug-content code {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }

        .debug-content ul, .debug-content ol {
          margin: 10px 0;
          padding-left: 20px;
        }

        .debug-content li {
          margin: 5px 0;
        }
      `}</style>
    </OnboardingLayout>
  );
};

export default OnboardingStep2Enhanced;