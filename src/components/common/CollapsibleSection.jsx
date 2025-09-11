import React, { useState } from 'react';
import './CollapsibleSection.css';

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`collapsible-section ${isOpen ? 'open' : ''}`}>
      <div className="collapsible-header" onClick={toggleOpen}>
        <h3 className="collapsible-title">{title}</h3>
        <div className="collapsible-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="collapsible-content">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;