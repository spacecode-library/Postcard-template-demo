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
        
        {/* Bottom info bar with logo and CTA */}
        <div className="bottom-info-bar">
          <div className="logo-section">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="business-logo" />
            ) : (
              <div className="logo-icon-wrapper">
                <svg className="logo-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  {/* Shirt with water drops */}
                  <g>
                    {/* Shirt outline */}
                    <path d="M20 5 L15 10 L15 13 C15 14 14 15 13 16 L13 30 C13 32 14 33 16 33 L24 33 C26 33 27 32 27 30 L27 16 C26 15 25 14 25 13 L25 10 L20 5 Z" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="2"/>
                    {/* Water drops */}
                    <circle cx="20" cy="20" r="2" fill="white"/>
                    <circle cx="16" cy="24" r="1.5" fill="white"/>
                    <circle cx="24" cy="24" r="1.5" fill="white"/>
                  </g>
                </svg>
              </div>
            )}
            <h2 className="business-name">{businessName}</h2>
          </div>

          <div className="cta-section">
            <p className="cta-text">{callToAction}</p>
            <div className="contact-info">
              <span className="phone">{phone}</span>
              <span className="separator">•</span>
              <span className="website">{website}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers strip at the very bottom */}
      <div className="offers-strip">
        {services.map((service, index) => (
          <div key={index} className="offer-card">
            <h3 className="offer-title">{service.title}</h3>
            <p className="offer-description">{service.description}</p>
            <p className="offer-disclaimer">{service.disclaimer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaundryProTemplate;