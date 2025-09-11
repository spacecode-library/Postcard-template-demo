import React from 'react';
import './CampaignSteps.css';

const Step1URL = ({ formData, onChange, onContinue }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.website) {
      onContinue();
    }
  };

  return (
    <div className="campaign-step-content">
      <h1 className="step-main-title">What's your business website URL?</h1>
      
      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-section">
          <label className="form-label">
            Website <span className="required">*</span>
          </label>
          <input
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="company.com"
            className="campaign-input"
            required
          />
        </div>
      </form>
    </div>
  );
};

export default Step1URL;