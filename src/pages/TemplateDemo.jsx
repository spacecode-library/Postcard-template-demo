import React, { useState } from 'react';
import PostcardTemplateRenderer from '../components/postcardTemplates/PostcardTemplateRenderer';
import { postcardTemplates } from '../components/postcardTemplates';
import { backgroundImages, getAllBackgrounds } from '../components/postcardTemplates/backgroundImages';
import './TemplateDemo.css';

const TemplateDemo = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(postcardTemplates[0]?.id || null);
  const [businessData, setBusinessData] = useState(() => {
    const template = postcardTemplates.find(t => t.id === postcardTemplates[0]?.id);
    return template?.defaultData || {};
  });

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceChange = (index, value) => {
    const newServices = [...businessData.services];
    newServices[index] = value;
    setBusinessData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const handlePriceChange = (index, field, value) => {
    const newPricing = [...businessData.pricing];
    newPricing[index][field] = field === 'price' ? parseInt(value) || 0 : parseInt(value) || 1;
    setBusinessData(prev => ({
      ...prev,
      pricing: newPricing
    }));
  };

  const addService = () => {
    setBusinessData(prev => ({
      ...prev,
      services: [...prev.services, 'New Service']
    }));
  };

  const removeService = (index) => {
    setBusinessData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="template-demo-container">
      <div className="demo-sidebar">
        <h2>Postcard Template Demo</h2>
        
        <div className="template-selector">
          <h3>Select Template</h3>
          <select 
            value={selectedTemplate} 
            onChange={(e) => {
              const newTemplateId = e.target.value;
              setSelectedTemplate(newTemplateId);
              const template = postcardTemplates.find(t => t.id === newTemplateId);
              if (template) {
                setBusinessData(template.defaultData);
              }
            }}
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
          
          <div className="form-group">
            <label>Business Name</label>
            <input 
              type="text" 
              value={businessData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Headline</label>
            <input 
              type="text" 
              value={businessData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Subheadline</label>
            <input 
              type="text" 
              value={businessData.subheadline}
              onChange={(e) => handleInputChange('subheadline', e.target.value)}
            />
          </div>

          {businessData.services && (
            <div className="form-group">
              <label>Services</label>
              {Array.isArray(businessData.services) && typeof businessData.services[0] === 'string' ? (
                // Simple string array services
                <>
                  {businessData.services.map((service, index) => (
                    <div key={index} className="service-input-group">
                      <input 
                        type="text" 
                        value={service}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                        className="service-input"
                      />
                      <button 
                        onClick={() => removeService(index)}
                        className="remove-btn"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addService}
                    className="add-btn"
                    type="button"
                  >
                    + Add Service
                  </button>
                </>
              ) : (
                // Object array services (for laundry template)
                <>
                  {businessData.services.map((service, index) => (
                    <div key={index} className="service-object-group">
                      <input 
                        type="text" 
                        value={service.title}
                        onChange={(e) => {
                          const newServices = [...businessData.services];
                          newServices[index] = { ...service, title: e.target.value };
                          setBusinessData(prev => ({ ...prev, services: newServices }));
                        }}
                        placeholder="Title"
                        className="service-title-input"
                      />
                      <input 
                        type="text" 
                        value={service.description}
                        onChange={(e) => {
                          const newServices = [...businessData.services];
                          newServices[index] = { ...service, description: e.target.value };
                          setBusinessData(prev => ({ ...prev, services: newServices }));
                        }}
                        placeholder="Description"
                        className="service-desc-input"
                      />
                      <input 
                        type="text" 
                        value={service.disclaimer}
                        onChange={(e) => {
                          const newServices = [...businessData.services];
                          newServices[index] = { ...service, disclaimer: e.target.value };
                          setBusinessData(prev => ({ ...prev, services: newServices }));
                        }}
                        placeholder="Disclaimer"
                        className="service-disclaimer-input"
                      />
                      <button 
                        onClick={() => {
                          const newServices = businessData.services.filter((_, i) => i !== index);
                          setBusinessData(prev => ({ ...prev, services: newServices }));
                        }}
                        className="remove-btn"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      setBusinessData(prev => ({
                        ...prev,
                        services: [...prev.services, { title: 'NEW', description: 'New Offer', disclaimer: 'With this card' }]
                      }));
                    }}
                    className="add-btn"
                    type="button"
                  >
                    + Add Offer
                  </button>
                </>
              )}
            </div>
          )}

          {businessData.pricing && (
            <div className="form-group">
              <label>Pricing Tiers</label>
              {businessData.pricing.map((tier, index) => (
                <div key={index} className="pricing-input-group">
                  <input 
                    type="number" 
                    value={tier.rooms}
                    onChange={(e) => handlePriceChange(index, 'rooms', e.target.value)}
                    className="rooms-input"
                    placeholder="Rooms"
                  />
                  <span className="price-prefix">$</span>
                  <input 
                    type="number" 
                    value={tier.price}
                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                    className="price-input"
                    placeholder="Price"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Phone</label>
            <input 
              type="text" 
              value={businessData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input 
              type="text" 
              value={businessData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Call to Action</label>
            <input 
              type="text" 
              value={businessData.callToAction}
              onChange={(e) => handleInputChange('callToAction', e.target.value)}
            />
          </div>

          {businessData.disclaimer !== undefined && (
            <div className="form-group">
              <label>Disclaimer</label>
              <input 
                type="text" 
                value={businessData.disclaimer || ''}
                onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                placeholder="e.g., With this card. Coupons cannot be combined."
              />
            </div>
          )}

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
          <h3>Preview - Postcard Size: 6" x 9"</h3>
        </div>
        <div className="postcard-preview-wrapper">
          <PostcardTemplateRenderer 
            templateId={selectedTemplate} 
            businessData={businessData} 
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateDemo;