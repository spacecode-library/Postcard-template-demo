import React, { useState, useEffect } from 'react';
import PostcardTemplateRenderer from '../components/postcardTemplates/PostcardTemplateRenderer';
import { postcardTemplates } from '../components/postcardTemplates';
import { backgroundImages } from '../components/postcardTemplates/backgroundImages';
import './TemplateDemo.css';

// Define field configurations for each template
const templateFieldConfigs = {
  'laundry-pro': {
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text' },
      { name: 'headline', label: 'Headline Top', type: 'text' },
      { name: 'subheadline', label: 'Headline Bottom', type: 'text' },
      { name: 'services', label: 'Offer Cards', type: 'array-object' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'callToAction', label: 'Call to Action', type: 'text' }
    ]
  },
  'sparkle-home': {
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text' },
      { name: 'headline', label: 'Headline', type: 'text' },
      { name: 'subheadline', label: 'Sparkle Text', type: 'text' },
      { name: 'tagline', label: 'Tag (Badge)', type: 'text' },
      { name: 'mainText', label: 'Main Text', type: 'text' },
      { name: 'offerAmount', label: 'Offer Amount', type: 'text' },
      { name: 'offerDescription', label: 'Offer Description', type: 'text' },
      { name: 'offerDisclaimer', label: 'Offer Disclaimer', type: 'text' },
      { name: 'services', label: 'Service Pills', type: 'array-string' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'callToAction', label: 'Call to Action', type: 'text' }
    ]
  },
  'pet-friendly': {
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text' },
      { name: 'headlineTop', label: 'Headline Top', type: 'text' },
      { name: 'headlineMain1', label: 'Main Line 1', type: 'text' },
      { name: 'headlineMain2', label: 'Main Line 2', type: 'text' },
      { name: 'headlineMain3', label: 'Main Line 3', type: 'text' },
      { name: 'headlineBottom', label: 'Headline Bottom', type: 'text' },
      { name: 'offer', label: 'Offer Text', type: 'text' },
      { name: 'offerDisclaimer', label: 'Offer Disclaimer', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'callToAction', label: 'Call to Action', type: 'text' }
    ]
  }
};

const TemplateDemoRefactored = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(postcardTemplates[0]?.id || null);
  const [businessData, setBusinessData] = useState({});
  const [currentFieldConfig, setCurrentFieldConfig] = useState([]);

  // Initialize data when component mounts or template changes
  useEffect(() => {
    const template = postcardTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setBusinessData({ ...template.defaultData });
      setCurrentFieldConfig(templateFieldConfigs[selectedTemplate]?.fields || []);
    }
  }, [selectedTemplate]);

  const handleTemplateChange = (newTemplateId) => {
    setSelectedTemplate(newTemplateId);
  };

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayStringChange = (field, index, value) => {
    const newArray = [...(businessData[field] || [])];
    newArray[index] = value;
    setBusinessData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleArrayObjectChange = (field, index, subField, value) => {
    const newArray = [...(businessData[field] || [])];
    newArray[index] = { ...newArray[index], [subField]: value };
    setBusinessData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handlePricingChange = (index, subField, value) => {
    const newPricing = [...(businessData.pricing || [])];
    newPricing[index] = {
      ...newPricing[index],
      [subField]: subField === 'price' ? parseInt(value) || 0 : parseInt(value) || 1
    };
    setBusinessData(prev => ({
      ...prev,
      pricing: newPricing
    }));
  };

  const addArrayItem = (field, type) => {
    const newItem = type === 'array-string' 
      ? 'New Item'
      : { title: 'NEW', description: 'New Offer', disclaimer: 'With this card' };
    
    setBusinessData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), newItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const renderField = (fieldConfig) => {
    const { name, label, type } = fieldConfig;
    const value = businessData[name];

    switch (type) {
      case 'text':
        return (
          <div key={name} className="form-group">
            <label>{label}</label>
            <input 
              type="text" 
              value={value || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
            />
          </div>
        );

      case 'array-string':
        return (
          <div key={name} className="form-group">
            <label>{label}</label>
            {(value || []).map((item, index) => (
              <div key={index} className="service-input-group">
                <input 
                  type="text" 
                  value={item}
                  onChange={(e) => handleArrayStringChange(name, index, e.target.value)}
                  className="service-input"
                />
                <button 
                  onClick={() => removeArrayItem(name, index)}
                  className="remove-btn"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem(name, 'array-string')}
              className="add-btn"
              type="button"
            >
              + Add {label.replace(/s$/, '')}
            </button>
          </div>
        );

      case 'array-object':
        return (
          <div key={name} className="form-group">
            <label>{label}</label>
            {(value || []).map((item, index) => (
              <div key={index} className="service-object-group">
                <input 
                  type="text" 
                  value={item.title || ''}
                  onChange={(e) => handleArrayObjectChange(name, index, 'title', e.target.value)}
                  placeholder="Title"
                  className="service-title-input"
                />
                <input 
                  type="text" 
                  value={item.description || ''}
                  onChange={(e) => handleArrayObjectChange(name, index, 'description', e.target.value)}
                  placeholder="Description"
                  className="service-desc-input"
                />
                <input 
                  type="text" 
                  value={item.disclaimer || ''}
                  onChange={(e) => handleArrayObjectChange(name, index, 'disclaimer', e.target.value)}
                  placeholder="Disclaimer"
                  className="service-disclaimer-input"
                />
                <button 
                  onClick={() => removeArrayItem(name, index)}
                  className="remove-btn"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem(name, 'array-object')}
              className="add-btn"
              type="button"
            >
              + Add {label.replace(/s$/, '')}
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div key={name} className="form-group">
            <label>{label}</label>
            {(value || []).map((tier, index) => (
              <div key={index} className="pricing-input-group">
                <input 
                  type="number" 
                  value={tier.rooms || ''}
                  onChange={(e) => handlePricingChange(index, 'rooms', e.target.value)}
                  className="rooms-input"
                  placeholder="Rooms"
                />
                <span className="price-prefix">$</span>
                <input 
                  type="number" 
                  value={tier.price || ''}
                  onChange={(e) => handlePricingChange(index, 'price', e.target.value)}
                  className="price-input"
                  placeholder="Price"
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="template-demo-container">
      <div className="demo-sidebar">
        <h2>Postcard Template Demo</h2>
        
        <div className="template-selector">
          <h3>Select Template</h3>
          <select 
            value={selectedTemplate} 
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="template-select"
          >
            {postcardTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <div className="data-editor">
          <h3>Customize Content</h3>
          
          {currentFieldConfig.map(fieldConfig => renderField(fieldConfig))}

          <div className="form-group">
            <label>Background Image</label>
            <div className="background-selector">
              <button
                type="button"
                className="background-option"
                onClick={() => handleInputChange('backgroundImage', null)}
                data-selected={!businessData.backgroundImage}
              >
                <div className="background-preview default">
                  <span>Default</span>
                </div>
              </button>
              {backgroundImages.cleaning.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  className="background-option"
                  onClick={() => handleInputChange('backgroundImage', bg.url)}
                  data-selected={businessData.backgroundImage === bg.url}
                >
                  <div 
                    className="background-preview"
                    style={{ backgroundImage: `url(${bg.url})` }}
                  >
                    <span className="background-name">{bg.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="demo-preview">
        <div className="preview-header">
          <h3>Preview - {postcardTemplates.find(t => t.id === selectedTemplate)?.name || 'Template'}</h3>
          <p className="preview-size">Postcard Size: 6" x 9"</p>
        </div>
        <div className="postcard-preview-wrapper">
          <PostcardTemplateRenderer 
            key={selectedTemplate} // Force re-render on template change
            templateId={selectedTemplate} 
            businessData={businessData} 
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateDemoRefactored;