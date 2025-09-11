import React, { useState } from 'react';
import './Step6Launch.css';

const Step6Launch = ({ formData, onLaunch, onBack }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      onLaunch();
    }, 2000);
  };

  return (
    <div className="launch-step">
      <h1 className="step-title">Review and Launch</h1>
      <p className="step-subtitle">Review your campaign details before launching</p>
      
      <div className="launch-review-container">
        <div className="review-section">
          <h3 className="section-title">Campaign Details</h3>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Campaign Name</span>
              <span className="review-value">{formData.campaignName || 'Untitled Campaign'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Budget</span>
              <span className="review-value">${formData.budget || '500'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Target Audience</span>
              <span className="review-value">{formData.targetAudience || 'Local Area'}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Estimated Reach</span>
              <span className="review-value">{formData.estimatedReach || '5,000'} people</span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3 className="section-title">Template</h3>
          <div className="template-preview-small">
            <img 
              src={formData.templateImage || '/api/placeholder/300/400'} 
              alt="Template preview" 
            />
          </div>
        </div>

        <div className="review-section">
          <h3 className="section-title">Schedule</h3>
          <div className="review-item">
            <span className="review-label">Start Date</span>
            <span className="review-value">{formData.startDate || 'Immediately'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Duration</span>
            <span className="review-value">{formData.duration || '2 weeks'}</span>
          </div>
        </div>

        <div className="launch-confirmation">
          <h3>Ready to Launch?</h3>
          <p>Once launched, your campaign will start reaching customers in your target area.</p>
          
          <div className="launch-actions">
            <button 
              className="launch-button primary" 
              onClick={handleLaunch}
              disabled={isLaunching}
            >
              {isLaunching ? 'Launching...' : 'Launch Campaign'}
            </button>
            <button className="launch-button secondary" onClick={onBack}>
              Back to Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Launch;