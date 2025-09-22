import React from 'react';
import './PetFriendlyTemplate.css';

const PetFriendlyTemplate = ({ businessData }) => {
  const {
    businessName = 'ABC',
    businessTagline = 'CARPET CLEANING',
    headlineTop = "Don't let",
    headlineMain1 = 'Food Stains',
    headlineMain2 = 'Crayons or',
    headlineMain3 = 'Dirty Paws',
    headlineBottom = 'ruin your carpets',
    offer = '1 Room Cleaned FREE!',
    offerDisclaimer = 'See back for details.',
    phone = '1-800-628-1804',
    website = 'www.website.com',
    callToAction = 'Call or visit us online today!',
    logoUrl = 'https://res.cloudinary.com/dizbrnm2l/image/upload/v1754576894/homid/favicons/60000001/favicon_1754576894254.png',
    backgroundImage = null
  } = businessData;

  return (
    <div className="pet-friendly-template">
      <div 
        className="background-section"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
      >
        <div className="message-note">
          <div className="note-content">
            <p className="top-line">{headlineTop}</p>
            <h1 className="main-lines">
              <span className="line-stains">{headlineMain1}</span>
              <span className="line-crayons">{headlineMain2}</span>
              <span className="line-paws">{headlineMain3}</span>
            </h1>
            <p className="bottom-line">{headlineBottom}</p>
          </div>
        </div>
        
        <div className="paw-prints"></div>
      </div>

      <div className="offer-ribbon">
        <h2 className="offer-text">{offer}</h2>
        <p className="offer-small">{offerDisclaimer}</p>
      </div>

      <div className="bottom-section">
        <div className="company-section">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="company-logo" />
          ) : (
            <div className="logo-icon">🏠</div>
          )}
          <div>
            <h3 className="company-name">{businessName}</h3>
            <p className="company-tagline">{businessTagline}</p>
          </div>
        </div>

        <div className="contact-section">
          <p className="cta-text">{callToAction}</p>
          <h4 className="phone-large">{phone}</h4>
          <p className="website-text">{website}</p>
        </div>
      </div>
    </div>
  );
};

export default PetFriendlyTemplate;