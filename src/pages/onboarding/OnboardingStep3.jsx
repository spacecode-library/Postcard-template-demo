import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';

const OnboardingStep3 = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    businessName: 'Brew & Bean',
    headline: "New in Town? Let's caffeinate!",
    offerText: 'Free small coffee with your first pastry',
    callToAction: 'Bring this postcard in to redeem your discount',
    address: '16th Avenue',
    phoneNumber: '+81 921234521',
    websiteUrl: 'brewbean@company.com',
    testimonialTagline: 'Perfect to start the day, Good Staff, Delicious'
  });
  
  const [showProductDetails, setShowProductDetails] = useState(true);
  
  // Load selected template from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(JSON.parse(savedTemplate));
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    navigate('/onboarding/step2');
  };

  const handleContinue = () => {
    navigate('/onboarding/step4');
  };

  const handleSaveAsDraft = () => {
    console.log('Save as draft', formData);
  };

  const handleGenerate = () => {
    console.log('Generate new postcard ideas');
  };

  const handleImageUpload = () => {
    console.log('Open image upload dialog');
  };

  return (
    <OnboardingLayout steps={steps} currentStep={3}>
        <div className="main-content editor-content">
          <button className="back-button" onClick={handleBack}>
            <ChevronLeft size={18} />
            Back
          </button>
          
          <h1 className="main-title">Customize your postcard</h1>
          
          <div className="editor-layout">
            <div className="postcard-preview-section">
              <div className="postcard-preview-editor">
                <img 
                  src={selectedTemplate?.image || "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=400&fit=crop"} 
                  alt="Postcard background" 
                  className="postcard-bg-image"
                />
                <div className="postcard-content-overlay">
                  <div className="postcard-logo">Logo</div>
                  <h2 className="postcard-title">{formData.businessName}</h2>
                  <h1 className="postcard-offer">{formData.offerText}</h1>
                  <p className="postcard-tagline">"{formData.headline}"</p>
                  <p className="postcard-cta">{formData.callToAction}</p>
                  
                  <div className="postcard-contact">
                    <p>{formData.address}</p>
                    <p>{formData.phoneNumber}</p>
                    <p>{formData.websiteUrl}</p>
                  </div>
                  
                  <p className="postcard-footer">{formData.testimonialTagline}</p>
                </div>
              </div>
              
              <div className="product-details-section">
                <button
                  className="product-details-toggle"
                  onClick={() => setShowProductDetails(!showProductDetails)}
                >
                  <span>Product Details</span>
                  {showProductDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
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
            </div>
            
            <div className="editor-form">
              <div className="template-info">
                <h3>Post Card - Template 1</h3>
              </div>
              
              <div className="form-field">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Headline *</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Offer Text *</label>
                <input
                  type="text"
                  name="offerText"
                  value={formData.offerText}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Call to Action *</label>
                <input
                  type="text"
                  name="callToAction"
                  value={formData.callToAction}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <h4 className="section-title">Business Details</h4>
              
              <div className="form-field">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Website URL *</label>
                <input
                  type="text"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Testimonial/Tagline</label>
                <input
                  type="text"
                  name="testimonialTagline"
                  value={formData.testimonialTagline}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-field">
                <label>Poster Image</label>
                <div className="image-upload-area" onClick={handleImageUpload}>
                  <Plus size={24} color="#6b7280" strokeWidth={2} />
                  <p>Click to upload or drag and drop</p>
                  <span>SVG, PNG, JPG or GIF (max. 600×400px)</span>
                </div>
              </div>
              
              <div className="idea-generator">
                <h4>Idea Generator</h4>
                <p>Tell us your wild idea, we can make the design more effectively for your business.</p>
                <div className="campaign-input">
                  <input
                    type="text"
                    placeholder="Postcard for f&b campaign"
                    defaultValue="Postcard for f&b campaign"
                  />
                  <button className="generate-button" onClick={handleGenerate}>
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-footer">
          <div className="footer-actions">
            <span className="step-indicator">Step 3 of 6</span>
            <div className="button-group">
              <button className="save-draft-button" onClick={handleSaveAsDraft}>
                Save as Draft
              </button>
              <button className="continue-button" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </div>
        </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep3;