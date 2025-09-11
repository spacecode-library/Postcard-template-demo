import React, { useState } from 'react';

const ProductDetails = () => {
  const [isOpen, setIsOpen] = useState(true);

  const details = [
    'Dimension: 5.3" x 7.5"',
    'Handwritten Text Length: Up to 500 characters included in base price (800 max)',
    'Envelope: Handwritten Envelope',
    'Stamp: Real Stamp'
  ];

  return (
    <div className="product-details">
      <div 
        className="product-details-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="product-details-title">Product Details</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className={`product-details-content ${isOpen ? 'open' : ''}`}>
        <ul>
          {details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetails;