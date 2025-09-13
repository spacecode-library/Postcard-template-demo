import React from 'react';
import './SparkleHomeTemplate.css';

const SparkleHomeTemplate = ({ businessData }) => {
  const {
    businessName = 'ABC CLEANING',
    headline = 'MAKE YOUR HOME',
    subheadline = 'sparkle with',
    tagline = 'PREMIUM',
    mainText = 'CLEANING SERVICES!',
    offerAmount = '$100 OFF',
    offerDescription = 'your first deep clean',
    offerDisclaimer = 'See back for details',
    services = ['Residential Cleaning', 'Deep Cleaning', 'Move In/Out Cleaning'],
    phone = '1-800-628-1804',
    website = 'www.website.com',
    callToAction = 'Call or visit us online to book your service!',
    logoUrl = null,
    backgroundImage = null
  } = businessData;

  return (
    <div className="sparkle-home-template">
      <div className="main-section">
        <div className="left-content">
          <div className="headline-section">
            <h1 className="headline-text">{headline}</h1>
            <div className="sparkle-line">
              <span className="sparkle-text">{subheadline}</span>
            </div>
            <div className="premium-badge">{tagline}</div>
            <h2 className="services-text">{mainText}</h2>
          </div>
          
          <div className="offer-coupon">
            <div className="coupon-amount">{offerAmount}</div>
            <div className="coupon-description">{offerDescription}</div>
            <div className="coupon-disclaimer">{offerDisclaimer}</div>
          </div>
        </div>

        <div 
          className="right-image"
          style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
        >
          <div className="cleaner-overlay"></div>
        </div>
      </div>

      <div className="services-strip">
        {services.map((service, index) => (
          <span key={index} className="service-badge">
            {typeof service === 'object' ? service.title || service.description : service}
          </span>
        ))}
      </div>

      <div className="footer-bar">
        <div className="company-info">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="company-logo" />
          ) : (
            <div className="logo-container">
              <span className="logo-letter">C</span>
              <span className="logo-sparkle">✨</span>
            </div>
          )}
          <h3 className="company-name">{businessName}</h3>
        </div>

        <div className="contact-bubble">
          <p className="cta-message">{callToAction}</p>
          <h4 className="phone-number">{phone}</h4>
          <p className="website-url">{website}</p>
        </div>
      </div>
    </div>
  );
};

export default SparkleHomeTemplate;