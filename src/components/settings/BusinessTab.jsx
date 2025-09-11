import React, { useState } from 'react';
import './BusinessTab.css';

const BusinessTab = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    businessName: 'Brew Coffee',
    businessAddress: 'brewcoffee@users.com',
    phoneNumber: '+81 9812012312',
    streetAddress: '100 Smith Street',
    industryCategory: 'F&B'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const industries = [
    'F&B',
    'Retail',
    'Technology',
    'Healthcare',
    'Education',
    'Real Estate',
    'Finance',
    'Manufacturing',
    'Other'
  ];

  return (
    <div className="business-tab">
      {/* Business Info Section */}
      <div className="settings-section">
        <h2 className="section-title">Business info</h2>
        
        <div className="form-row">
          <label className="form-label">
            Business Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Business name"
          />
        </div>

        <div className="form-row">
          <label className="form-label">
            Business Address <span className="required">*</span>
          </label>
          <div className="email-input-container">
            <svg className="email-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5L10 10L17 5M3 5V15C3 15.5523 3.44772 16 4 16H16C16.5523 16 17 15.5523 17 15V5M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5" 
                stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="email"
              className="form-input email-input"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              placeholder="Business email address"
            />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <div className="phone-input-container">
            <input
              type="tel"
              className="form-input phone-input"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            <svg className="dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">
            Street address <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.streetAddress}
            onChange={(e) => handleInputChange('streetAddress', e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="form-row">
          <label className="form-label">
            Industry Category <span className="required">*</span>
          </label>
          <div className="select-container">
            <select
              className="form-select"
              value={formData.industryCategory}
              onChange={(e) => handleInputChange('industryCategory', e.target.value)}
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <svg className="select-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="settings-footer">
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="save-button" onClick={() => onSave(formData)}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BusinessTab;