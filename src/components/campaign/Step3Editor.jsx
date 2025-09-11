import React, { useState } from 'react';
import './Step3Editor.css';

const Step3Editor = ({ formData, onChange, onContinue, onBack }) => {
  const [editorData, setEditorData] = useState({
    headline: formData.headline || '',
    subheadline: formData.subheadline || '',
    bodyText: formData.bodyText || '',
    ctaText: formData.ctaText || 'Learn More',
    logo: formData.logo || null,
    images: formData.images || []
  });

  const handleFieldChange = (field, value) => {
    const updated = { ...editorData, [field]: value };
    setEditorData(updated);
    onChange(updated);
  };

  const handleImageUpload = (e) => {
    // Placeholder for image upload
    const file = e.target.files[0];
    if (file) {
      console.log('Image uploaded:', file.name);
    }
  };

  const handleContinue = () => {
    if (editorData.headline && editorData.bodyText) {
      onContinue();
    }
  };

  return (
    <div className="editor-section">
      <h1 className="step-main-title">Customize your postcard</h1>
      
      <div className="editor-container">
        <div className="editor-preview">
          <div className="postcard-preview">
            <div className="postcard-front">
              <div className="preview-header">Front Side</div>
              <div className="postcard-content">
                <div className="logo-area">
                  {editorData.logo ? 'Logo' : '[Logo]'}
                </div>
                <h2 className="preview-headline">{editorData.headline || 'Your Headline Here'}</h2>
                <p className="preview-subheadline">{editorData.subheadline || 'Your subheadline here'}</p>
                <div className="preview-image-area">
                  [Main Image]
                </div>
                <button className="preview-cta">{editorData.ctaText}</button>
              </div>
            </div>
            
            <div className="postcard-back">
              <div className="preview-header">Back Side</div>
              <div className="postcard-content">
                <p className="preview-body">{editorData.bodyText || 'Your message here...'}</p>
                <div className="address-area">
                  <div className="address-placeholder">[Recipient Address]</div>
                  <div className="postage-placeholder">[Postage]</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-controls">
          <h3 className="controls-title">Edit Content</h3>
          
          <div className="editor-form">
            <div className="form-group">
              <label className="form-label">
                Headline <span className="required">*</span>
              </label>
              <input
                type="text"
                value={editorData.headline}
                onChange={(e) => handleFieldChange('headline', e.target.value)}
                placeholder="Enter your headline"
                className="campaign-input"
                maxLength="50"
              />
              <span className="char-count">{editorData.headline.length}/50</span>
            </div>

            <div className="form-group">
              <label className="form-label">Subheadline</label>
              <input
                type="text"
                value={editorData.subheadline}
                onChange={(e) => handleFieldChange('subheadline', e.target.value)}
                placeholder="Enter your subheadline"
                className="campaign-input"
                maxLength="80"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Body Text <span className="required">*</span>
              </label>
              <textarea
                value={editorData.bodyText}
                onChange={(e) => handleFieldChange('bodyText', e.target.value)}
                placeholder="Enter your message"
                className="campaign-textarea"
                rows="4"
                maxLength="200"
              />
              <span className="char-count">{editorData.bodyText.length}/200</span>
            </div>

            <div className="form-group">
              <label className="form-label">Call to Action Button</label>
              <input
                type="text"
                value={editorData.ctaText}
                onChange={(e) => handleFieldChange('ctaText', e.target.value)}
                placeholder="Button text"
                className="campaign-input"
                maxLength="20"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Logo</label>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Upload Logo
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Images</label>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="file-input"
                  id="images-upload"
                />
                <label htmlFor="images-upload" className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Upload Images
                </label>
              </div>
              <p className="upload-hint">Upload up to 3 images</p>
            </div>
          </div>
        </div>
      </div>

      <div className="campaign-footer">
        <div className="footer-message">
          Customize your postcard with your brand message
        </div>
        <div className="footer-actions">
          <span className="step-indicator">Step 3 of 6</span>
          <div className="footer-buttons">
            <button className="campaign-button back-button" onClick={onBack}>
              Back
            </button>
            <button className="campaign-button save-draft-button">
              Save Draft
            </button>
            <button 
              className="campaign-button continue-button" 
              onClick={handleContinue}
              disabled={!editorData.headline || !editorData.bodyText}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Editor;