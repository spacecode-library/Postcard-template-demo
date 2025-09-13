import React from 'react';
import './LaundryProTemplate.css';

const LaundryProTemplate = ({ businessData }) => {
  const {
    businessName = 'ABC LAUNDRY',
    headline = 'DROP OFF YOUR',
    subheadline = 'DRY CLEANING!',
    services = [
      { title: 'FREE', description: 'Single Item Cleaning', disclaimer: 'With this card' },
      { title: 'FREE', description: 'Soap for One Wash', disclaimer: 'With this card' },
      { title: 'FREE', description: 'Drying on Monday', disclaimer: 'With this card' },
      { title: 'FREE', description: 'Folding for 10 Items', disclaimer: 'With this card' }
    ],
    phone = '1-800-628-1804',
    website = 'www.website.com',
    callToAction = 'CALL OR VISIT US TODAY!',
    logoUrl = 'https://res.cloudinary.com/dizbrnm2l/image/upload/v1755706906/homid/favicons/87000006/favicon_1755706904781.png',
    backgroundImage = null
  } = businessData;

  return (
    <div className="laundry-pro-template">
      <div className="header-section">
        <h1 className="headline-text">
          <span className="headline-top">{headline}</span>
          <span className="headline-bottom">{subheadline}</span>
        </h1>
      </div>

      <div 
        className="middle-section"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      >
        <div className="washing-machines-overlay"></div>
        
        {/* Offers positioned over washing machines */}
        <div className="offers-section">
          {services.map((service, index) => (
            <div key={index} className="offer-card">
              <h3 className="offer-title">{service.title}</h3>
              <p className="offer-description">{service.description}</p>
              <p className="offer-disclaimer">{service.disclaimer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-section">
        <div className="logo-area">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="business-logo" />
          ) : (
            <div className="logo-placeholder">
              <svg className="logo-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                {/* Shirt shape */}
                <path d="M20 4 L16 8 L16 12 C16 13 15 14 14 15 L14 32 C14 34 15 35 17 35 L23 35 C25 35 26 34 26 32 L26 15 C25 14 24 13 24 12 L24 8 L20 4 Z" 
                      fill="white"/>
                {/* Dots/bubbles */}
                <circle cx="20" cy="20" r="2" fill="#17A2B8"/>
                <circle cx="16" cy="24" r="1.5" fill="#17A2B8"/>
                <circle cx="24" cy="24" r="1.5" fill="#17A2B8"/>
                <circle cx="20" cy="28" r="1" fill="#17A2B8"/>
              </svg>
            </div>
          )}
          <h2 className="business-name">{businessName}</h2>
        </div>

        <div className="cta-area">
          <p className="cta-text">{callToAction}</p>
          <div className="contact-info">
            <span className="phone">{phone}</span>
            <span className="separator">•</span>
            <span className="website">{website}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundryProTemplate;