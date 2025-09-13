import React from 'react';
import './FreshCleanTemplate.css';

const FreshCleanTemplate = ({ businessData }) => {
  const {
    businessName = 'Your Business Name',
    headline = 'LOVE YOUR CARPETS',
    subheadline = 'AGAIN!',
    services = ['Food & Wine Stains', 'Dirt & Dust', 'Mold & Mildew', 'Odors'],
    pricing = [
      { rooms: 1, price: 30 },
      { rooms: 2, price: 50 },
      { rooms: 3, price: 70 },
      { rooms: 4, price: 90 },
      { rooms: 5, price: 110 }
    ],
    phone = '1-800-628-1804',
    website = 'www.website.com',
    callToAction = 'Call or visit us online today!',
    disclaimer = 'With this card. Coupons can not be combined.',
    logoUrl = null,
    backgroundImage = null
  } = businessData;

  return (
    <div className="fresh-clean-template">
      <div 
        className="template-left"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      >
        <div className="headline-container">
          <h1 className="main-headline">{headline}</h1>
          <h1 className="sub-headline">{subheadline}</h1>
        </div>
        
        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <span className="service-bullet">•</span>
              <span className="service-text">
                {typeof service === 'object' ? service.title || service.description : service}
              </span>
            </div>
          ))}
        </div>
        
        <div className="bottom-section">
          <div className="logo-section">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="business-logo" />
            ) : (
              <div className="logo-wrapper">
                <svg className="logo-icon" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                  {/* Water drop shape */}
                  <path d="M20 5 C20 5 8 15 8 28 C8 38 13 43 20 43 C27 43 32 38 32 28 C32 15 20 5 20 5 Z" 
                        fill="#4CAF50"/>
                  {/* Inner highlight */}
                  <path d="M16 25 C16 25 13 28 13 32 C13 35 14.5 36 16 36" 
                        fill="white" opacity="0.3"/>
                </svg>
                <span className="logo-text">ABC</span>
              </div>
            )}
            <h2 className="business-name">CARPET CLEANING</h2>
          </div>
          
          <div className="cta-section">
            <p className="cta-text">{callToAction}</p>
            <h3 className="phone-number">{phone}</h3>
            <p className="website">{website}</p>
          </div>
        </div>
      </div>
      
      <div className="template-right">
        <div className="pricing-container">
          {pricing.map((item, index) => (
            <div key={index} className="pricing-item">
              <div className="price-amount">${item.price}</div>
              <div className="price-details">
                <span className="room-count">{item.rooms} ROOM</span>
                <span className="disclaimer-text">{disclaimer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreshCleanTemplate;