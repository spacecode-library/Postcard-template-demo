import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <button  
          className="back-button" 
          onClick={handleBack}
          disabled={isLoading}
          >
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
        
        <div className="footer-section">
          <div className="footer-text">
            Enter your website URL and select your business category to continue
          </div>
          <div className="footer-actions">
            <span className="step-indicator">Step 1 of 6</span>
            <button 
            className="continue-button"
              onClick={handleContinue}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingStep1;