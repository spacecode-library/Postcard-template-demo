import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
import OnboardingFooter from '../../components/onboarding/OnboardingFooter';
import newMoverService from '../../supabase/api/newMoverService';
import toast from 'react-hot-toast'

const OnboardingStep4 = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    radius: '',
    homeOwners: true,
    renters: true
  });

  // New state for ZIP codes
  const [zipCodes, setZipCodes] = useState([]);
  const [zipCodeInput, setZipCodeInput] = useState('');

  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  const [fetchingNewMovers, setFetchingNewMovers] = useState(false);


  const steps = [
    { number: 1, title: 'URL Business', subtitle: 'Please provide email' },
    { number: 2, title: 'Select Postcard Template', subtitle: 'Setup your template' },
    { number: 3, title: 'Postcard Editor', subtitle: 'Customize your campaign' },
    { number: 4, title: 'Targeting & Budget', subtitle: 'Setup your business financial goals' },
    { number: 5, title: 'Payment Setup', subtitle: 'Provide payment flow' },
    { number: 6, title: 'Launch Campaign', subtitle: 'Finish your website setup' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleApply = () => {
    // Apply the radius targeting settings
    console.log('Applying radius settings:', formData);
  };

  // Handle ZIP code input
  const handleZipCodeInputChange = (e) => {
    setZipCodeInput(e.target.value);
  };

  // Add ZIP code on Enter key or comma
  const handleZipCodeKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addZipCode();
    }
  };

  // Add ZIP code to the list
  const addZipCode = () => {
    const trimmedZip = zipCodeInput.trim();

    // Validate ZIP code (5 digits)
    if (!/^\d{5}$/.test(trimmedZip)) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }

    // Check for duplicates
    if (zipCodes.includes(trimmedZip)) {
      toast.error('This ZIP code is already added');
      return;
    }

    // Add to list
    setZipCodes(prev => [...prev, trimmedZip]);
    setZipCodeInput('');
    toast.success('ZIP code added successfully');
  };

  // Remove ZIP code from list
  const removeZipCode = (zipToRemove) => {
    setZipCodes(prev => prev.filter(zip => zip !== zipToRemove));
  };


  const handleBack = () => {
    navigate('/onboarding/step3');
  };

  // const handleContinue = () => {
  //   if (canContinue()) {
  //     navigate('/onboarding/step5');
  //   }
  // };

  const handleContinue = async () => {
    if (!canContinue()) {
      toast.error('Please complete the required fields');
      return;
    }

    setLoading(true);
    setFetchingNewMovers(true);

    try {
      // If ZIP code option is selected, fetch and save new movers
      if (selectedOption === 'zip' && zipCodes.length > 0) {
        toast.loading('Fetching new movers from Melissa API...', { id: 'fetch-movers' });

        // Call the fetchAndSave function from newMoverService
        const result = await newMoverService.fetchAndSave(zipCodes);

        if (result.success) {
          toast.success(`${result.saved} new mover records saved successfully!`, {
            id: 'fetch-movers',
            duration: 4000
          });

          // Store the targeting data in session/local storage for later use
          sessionStorage.setItem('targetingData', JSON.stringify({
            option: selectedOption,
            zipCodes: zipCodes,
            newMoversCount: result.saved
          }));

          console.log('New movers saved:', result);
        } else {
          toast.error('No new movers found for the specified ZIP codes', { id: 'fetch-movers' });
        }
      }

      // If radius option is selected, store the radius data
      if (selectedOption === 'radius') {
        sessionStorage.setItem('targetingData', JSON.stringify({
          option: selectedOption,
          location: formData.location,
          radius: formData.radius,
          homeOwners: formData.homeOwners,
          renters: formData.renters
        }));
      }

      // Navigate to next step after successful save
      setTimeout(() => {
        navigate('/onboarding/step5');
      }, 1000);

    } catch (error) {
      console.error('Error fetching new movers:', error);
      toast.error(`Failed to fetch new movers: ${error.message}`, {
        id: 'fetch-movers',
        duration: 5000
      });
    } finally {
      setLoading(false);
      setFetchingNewMovers(false);
    }
  };

  const canContinue = () => {
    if (selectedOption === 'radius') {
      return formData.location && formData.radius;
    }
    if (selectedOption === 'zip') {
      return zipCodes.length > 0;
    }
    return false;
  };

  return (
    <OnboardingLayout steps={steps} currentStep={4}>
      <div className="main-content">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <h1 className="main-title">Targeting & Budget</h1>

        <div className="targeting-options">
          {/* Business Radius Option */}
          <div
            className={`targeting-option ${selectedOption === 'radius' ? 'selected' : ''}`}
            onClick={() => handleOptionSelect('radius')}
          >
            <div className="targeting-option-header">
              <svg className="targeting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              <h3>Business Radius</h3>
              {selectedOption === 'radius' && (
                <svg className="targeting-icon" viewBox="0 0 24 24" fill="none" stroke="#20B2AA" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </div>
            <p>Enter your business address and select a distance radius around it for new mover deliveries</p>
          </div>

          {/* ZIP Codes Option */}
          <div
            className={`targeting-option ${selectedOption === 'zip' ? 'selected' : ''}`}
            onClick={() => handleOptionSelect('zip')}
          >
            <div className="targeting-option-header">
              <svg className="targeting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3>ZIP Codes</h3>
              {selectedOption === 'zip' && (
                <svg className="targeting-icon" viewBox="0 0 24 24" fill="none" stroke="#20B2AA" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </div>
            <p>Enter individual or multiple Zip Codes for new mover mail (Press Enter after each new Zip Code)</p>
          </div>
        </div>

        {/* Business Radius Form */}
        {selectedOption === 'radius' && (
          <div className="targeting-form">
            <div className="targeting-form-section">
              <label>Location *</label>
              <div className="location-input-group">
                <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  name="location"
                  className="location-input"
                  placeholder="Input detail address"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="targeting-form-section">
              <label>Radius *</label>
              <input
                type="text"
                name="radius"
                placeholder="Input radius range numbers"
                value={formData.radius}
                onChange={handleInputChange}
              />
            </div>

            <div className="targeting-form-section">
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="homeOwners"
                    name="homeOwners"
                    checked={formData.homeOwners}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="homeOwners">Home Owners</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="renters"
                    name="renters"
                    checked={formData.renters}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="renters">Renters</label>
                </div>
              </div>
            </div>

            <div className="map-section">
              <label>Map View (Pick a point of radius on the map)</label>
              <div className="map-container">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
                  alt="Map view"
                  className="map-placeholder"
                />
                <button className="apply-button" onClick={handleApply}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ZIP Codes Form */}
        {selectedOption === 'zip' && (
          <div className="targeting-form">
            <div className="targeting-form-section">
              <label>ZIP Code Area *</label>
              <div className="zip-code-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter ZIP Code and press Enter"
                  value={zipCodeInput}
                  onChange={handleZipCodeInputChange}
                  onKeyDown={handleZipCodeKeyDown}
                  disabled={loading}
                />
                <button
                  className="add-zip-button"
                  onClick={addZipCode}
                  disabled={loading || !zipCodeInput.trim()}
                >
                  Add
                </button>
              </div>
              <p className="input-hint">
                Press Enter or click Add after typing each ZIP code
              </p>
            </div>

            {/* Display added ZIP codes */}
            {zipCodes.length > 0 && (
              <div className="zip-codes-list">
                <label>Added ZIP Codes ({zipCodes.length})</label>
                <div className="zip-codes-tags">
                  {zipCodes.map((zip, index) => (
                    <div key={index} className="zip-code-tag">
                      <span>{zip}</span>
                      <button
                        onClick={() => removeZipCode(zip)}
                        className="remove-zip-button"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {fetchingNewMovers && (
              <div className="fetching-indicator">
                <div className="spinner"></div>
                <p>Fetching new movers from Melissa API...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <OnboardingFooter
        message="Please select the option or range area for your postcard package first, before continue to the next step"
        currentStep={4}
        totalSteps={6}
        onContinue={handleContinue}
        continueDisabled={!canContinue() || loading}
        continueText={loading ? 'Processing...' : 'Continue'}
      />
    </OnboardingLayout>
  );
};

export default OnboardingStep4;