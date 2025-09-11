import React, { useState } from 'react';
import './Step4Targeting.css';

const Step4Targeting = ({ formData, onChange, onContinue, onBack }) => {
  const [targetingData, setTargetingData] = useState({
    targetType: formData.targetType || 'radius',
    radius: formData.radius || 5,
    zipCodes: formData.zipCodes || '',
    estimatedReach: formData.estimatedReach || 0
  });

  const handleFieldChange = (field, value) => {
    const updated = { ...targetingData, [field]: value };
    
    // Calculate estimated reach based on selection
    if (field === 'radius') {
      updated.estimatedReach = value * 1000; // Simplified calculation
    } else if (field === 'zipCodes') {
      const zips = value.split(',').filter(z => z.trim().length === 5);
      updated.estimatedReach = zips.length * 2500; // Simplified calculation
    }
    
    setTargetingData(updated);
    onChange(updated);
  };

  const handleContinue = () => {
    if ((targetingData.targetType === 'radius' && targetingData.radius) ||
        (targetingData.targetType === 'zipcodes' && targetingData.zipCodes)) {
      onContinue();
    }
  };

  return (
    <div className="targeting-section">
      <h1 className="step-main-title">Select your target audience</h1>
      
      <div className="targeting-container">
        <div className="map-preview">
          <div className="map-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="map-icon">
              <path d="M24 4C15.163 4 8 11.163 8 20C8 30 24 44 24 44C24 44 40 30 40 20C40 11.163 32.837 4 24 4Z" stroke="#20B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="20" r="6" stroke="#20B2AA" strokeWidth="2"/>
            </svg>
            <p>Map Preview</p>
            <span className="map-subtitle">Your targeted area will appear here</span>
          </div>
        </div>

        <div className="targeting-controls">
          <h3 className="controls-title">Targeting Options</h3>
          
          <div className="targeting-form">
            <div className="target-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="targetType"
                  value="radius"
                  checked={targetingData.targetType === 'radius'}
                  onChange={(e) => handleFieldChange('targetType', e.target.value)}
                />
                <span className="radio-label">
                  <span className="radio-circle"></span>
                  Target by Radius
                </span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="targetType"
                  value="zipcodes"
                  checked={targetingData.targetType === 'zipcodes'}
                  onChange={(e) => handleFieldChange('targetType', e.target.value)}
                />
                <span className="radio-label">
                  <span className="radio-circle"></span>
                  Target by ZIP Codes
                </span>
              </label>
            </div>

            {targetingData.targetType === 'radius' ? (
              <div className="form-group">
                <label className="form-label">
                  Select Radius <span className="required">*</span>
                </label>
                <div className="radius-selector">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={targetingData.radius}
                    onChange={(e) => handleFieldChange('radius', parseInt(e.target.value))}
                    className="radius-slider"
                  />
                  <div className="radius-display">
                    <span className="radius-value">{targetingData.radius}</span>
                    <span className="radius-unit">miles</span>
                  </div>
                </div>
                <div className="radius-markers">
                  <span>1 mi</span>
                  <span>25 mi</span>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  Enter ZIP Codes <span className="required">*</span>
                </label>
                <textarea
                  value={targetingData.zipCodes}
                  onChange={(e) => handleFieldChange('zipCodes', e.target.value)}
                  placeholder="Enter ZIP codes separated by commas (e.g., 10001, 10002, 10003)"
                  className="campaign-textarea"
                  rows="3"
                />
                <p className="field-hint">Enter up to 10 ZIP codes</p>
              </div>
            )}

            <div className="reach-estimate">
              <div className="reach-header">
                <h4>Estimated Reach</h4>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="info-icon">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="#6B7280" strokeWidth="1.5"/>
                  <path d="M8 11V8M8 5H8.01" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="reach-stats">
                <div className="stat-item">
                  <span className="stat-value">{targetingData.estimatedReach.toLocaleString()}</span>
                  <span className="stat-label">Households</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">${(targetingData.estimatedReach * 0.50).toLocaleString()}</span>
                  <span className="stat-label">Estimated Cost</span>
                </div>
              </div>
            </div>

            <div className="targeting-tips">
              <h4>Targeting Tips</h4>
              <ul>
                <li>Start with a smaller radius for more targeted campaigns</li>
                <li>Consider your business location and customer base</li>
                <li>ZIP code targeting is great for specific neighborhoods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="campaign-footer">
        <div className="footer-message">
          Choose your target area to reach potential customers
        </div>
        <div className="footer-actions">
          <span className="step-indicator">Step 4 of 6</span>
          <div className="footer-buttons">
            <button className="campaign-button back-button" onClick={onBack}>
              Back
            </button>
            <button 
              className="campaign-button continue-button" 
              onClick={handleContinue}
              disabled={
                (targetingData.targetType === 'radius' && !targetingData.radius) ||
                (targetingData.targetType === 'zipcodes' && !targetingData.zipCodes)
              }
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Targeting;