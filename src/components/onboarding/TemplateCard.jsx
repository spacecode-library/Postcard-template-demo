import React from 'react';

const TemplateCard = ({ template, isSelected, onSelect }) => {
  return (
    <div 
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(template)}
    >
      <div className="template-image-container">
        <img 
          src={template.image} 
          alt={template.name} 
          className="template-image"
        />
      </div>
      <div className="template-info">
        <h3 className="template-name">{template.name}</h3>
        <button 
          className="template-button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template);
          }}
        >
          {isSelected ? 'Selected' : 'Customize'}
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;