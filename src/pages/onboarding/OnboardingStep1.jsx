import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Palette } from 'lucide-react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import brandfetchService from '../../supabase/api/brandFetchService';
import supabaseCompanyService from '../../supabase/api/companyService';
import toast from 'react-hot-toast'

const OnboardingStep1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    website: '',
    businessCategory: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBrand, setIsFetchingBrand] = useState(false);
  const [brandPreview, setBrandPreview] = useState(null);

  const steps = [
    { number: 1, title: 'Business URL', subtitle: 'Please provide email' },
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

  const handleContinue = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setIsFetchingBrand(true);

    try {
      // Step 1: Fetch brand information from Brandfetch
      toast.loading('Fetching your brand information...', { id: 'brand-fetch' });
      
      let brandData = null;
      try {
        brandData = await brandfetchService.fetchBrandInfo(formData.website);
        toast.success('Brand information retrieved!', { id: 'brand-fetch' });

        // Set brand preview to show to user
        if (brandData) {
          setBrandPreview({
            name: brandData.name,
            logo: brandData.logo?.primary || brandData.logo?.icon,
            colors: brandData.colors
          });
        }
      } catch (brandError) {
        console.warn('Brandfetch error:', brandError);
        toast.dismiss('brand-fetch');
        toast.error('Could not fetch brand info, but you can continue with manual setup');
        // Continue anyway - we'll use default values
      }

      setIsFetchingBrand(false);

      // Step 2: Prepare company data
      const companyData = {
        website: formData.website,
        businessCategory: formData.businessCategory,
        name: brandData?.name || extractCompanyNameFromURL(formData.website),
        domain: brandData?.domain || brandfetchService.extractDomain(formData.website),
        description: brandData?.description || '',
        industry: brandData?.industry || formData.businessCategory,
        logo: brandData?.logo || null,
        colors: brandData?.colors || {
          primary: '#20B2AA',
          secondary: '#15B79E',
          accent: null,
          palette: []
        },
        fonts: brandData?.fonts || [],
        socialLinks: brandData?.socialLinks || {},
        companyInfo: brandData?.companyInfo || {},
        rawData: brandData?.rawData || null
      };

      // Step 3: Save to Supabase database
      // toast.loading('Saving your company information...', { id: 'company-save' });
      
      const saveResult = await supabaseCompanyService.saveCompanyInfo(companyData);
      
      toast.success('Company information saved!', { id: 'company-save' });

      // Step 4: Store in localStorage for use in next steps
      localStorage.setItem('onboardingStep1', JSON.stringify({
        ...formData,
        companyData: companyData,
        companyId: saveResult.company.id
      }));

      // Step 5: Navigate to next step
      navigate('/onboarding/step2');
      
    } catch (error) {
      console.error('Onboarding Step 1 error:', error);
      toast.error(error.error || 'Failed to process your information. Please try again.');
    } finally {
      setIsLoading(false);
      setIsFetchingBrand(false);
    }
  };

  const isFormValid = () => {
    return formData.website && 
           formData.businessCategory &&
           isValidURL(formData.website);
  };

  const isValidURL = (url) => {
    try {
      // Add protocol if missing
      const testUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  };

  const extractCompanyNameFromURL = (url) => {
    try {
      const domain = brandfetchService.extractDomain(url);
      // Remove TLD and capitalize
      const name = domain.split('.')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
      return 'My Company';
    }
  };

  return (
    <OnboardingLayout steps={steps} currentStep={1}>
      <div className="main-content">
        <motion.button
          className="back-button"
          onClick={handleBack}
          disabled={isLoading}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={18} />
          Back
        </motion.button>
        
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
              disabled={isLoading}
            />
            {formData.website && !isValidURL(formData.website) && (
              <span className="error-text" style={{ fontSize: '0.875rem', color: '#DC2626', marginTop: '0.25rem', display: 'block' }}>
                Please enter a valid URL
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="businessCategory">Business Category *</label>
            <select
              id="businessCategory"
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              required
              disabled={isLoading}
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

        {/* Brand Preview Card */}
        {brandPreview && (
          <motion.div
            className="brand-preview-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#F7FAFC',
              borderRadius: '12px',
              border: '2px solid #20B2AA'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#20B2AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Check size={28} strokeWidth={3} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1A202C' }}>
                  Brand Found: {brandPreview.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>
                  Your brand identity has been retrieved successfully
                </p>
              </div>
            </div>

            {brandPreview.logo && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img
                  src={brandPreview.logo}
                  alt={`${brandPreview.name} logo`}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '80px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}

            {brandPreview.colors && brandPreview.colors.palette && brandPreview.colors.palette.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: '600', color: '#4A5568', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={16} /> Brand Colors:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {brandPreview.colors.palette.slice(0, 6).map((color, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: color.hex || color,
                          borderRadius: '8px',
                          border: '2px solid #E2E8F0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        title={color.hex || color}
                      />
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#718096',
                        fontFamily: 'monospace'
                      }}>
                        {(color.hex || color).toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#E6FFFA',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#234E52'
            }}>
              <strong>Next:</strong> These colors will be automatically applied to your postcard template in the editor!
            </div>
          </motion.div>
        )}

        <div className="footer-section">
          <div className="footer-text">
            Enter your website URL and select your business category to continue
          </div>
          <div className="footer-actions">
            <span className="step-indicator">Step 1 of 6</span>
            <motion.button
              className="continue-button"
              onClick={handleContinue}
              disabled={!isFormValid() || isLoading}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 16px rgba(32, 178, 170, 0.25)" }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </motion.button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep1;