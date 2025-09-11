import React, { useState } from 'react';
import TemplateCard from '../onboarding/TemplateCard';
import ProductDetails from '../onboarding/ProductDetails';
import './Step2Templates.css';

const templates = [
  {
    id: 1,
    name: 'Holiday Sale',
    image: '/api/placeholder/300/400',
    isPopular: true
  },
  {
    id: 2,
    name: 'Grand Opening',
    image: '/api/placeholder/300/400',
    isPopular: false
  },
  {
    id: 3,
    name: 'Special Offer',
    image: '/api/placeholder/300/400',
    isPopular: true
  },
  {
    id: 4,
    name: 'New Arrival',
    image: '/api/placeholder/300/400',
    isPopular: false
  }
];

const Step2Templates = ({ formData, onChange, onContinue, onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(formData.templateId || null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    onChange({ templateId });
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onContinue();
    }
  };

  const handleBackClick = () => {
    if (selectedTemplate) {
      setShowLeaveModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    onBack();
  };

  return (
    <div className="templates-step">
      <div className="templates-header">
        <h1 className="step-title">Select Postcard Template</h1>
        <p className="step-subtitle">Setup your template</p>
      </div>
      
      <div className="templates-content">
        <div className="templates-main">
          <div className="templates-grid">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => handleSelectTemplate(template.id)}
              />
            ))}
          </div>
        </div>

        <div className="template-sidebar">
          <ProductDetails />
        </div>
      </div>

      {/* Footer */}
      <div className="campaign-footer">
        <div className="footer-message">
          {selectedTemplate 
            ? `Template selected: ${templates.find(t => t.id === selectedTemplate)?.name}`
            : 'Please select a template to continue'}
        </div>
        <div className="footer-actions">
          <span className="step-indicator">Step 2 of 6</span>
          <div className="footer-buttons">
            <button className="campaign-button back-button" onClick={handleBackClick}>
              Back
            </button>
            <button className="campaign-button continue-button" 
              onClick={handleContinue}
              disabled={!selectedTemplate}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="modal-backdrop">
          <div className="leave-modal">
            <h3>Leave Template Selection?</h3>
            <p>Your template selection will be lost. Are you sure you want to go back?</p>
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </button>
              <button className="modal-button confirm" onClick={handleConfirmLeave}>
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2Templates;