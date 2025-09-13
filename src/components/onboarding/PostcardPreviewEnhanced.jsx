import React from 'react';
import PostcardTemplateRenderer from '../postcardTemplates/PostcardTemplateRenderer';

const PostcardPreviewEnhanced = ({ template, businessData, onPrevious, onNext, canGoPrev, canGoNext }) => {
  if (!template) {
    return (
      <div className="empty-preview">
        <div className="empty-preview-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="12" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M6 18L24 30L42 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="36" cy="18" r="2" fill="currentColor"/>
          </svg>
        </div>
        <h3>Select a template to start designing</h3>
        <p>Click <strong>Try it</strong> on any template below to see your postcard come to life</p>
      </div>
    );
  }

  return (
    <>
      <button 
        className="preview-nav prev" 
        onClick={onPrevious}
        disabled={!canGoPrev}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="template-preview has-template">
        {template.templateId ? (
          <PostcardTemplateRenderer 
            templateId={template.templateId} 
            businessData={businessData} 
          />
        ) : (
          <>
            <img 
              src={template.image} 
              alt="Template background" 
              className="preview-bg-image"
            />
            <div className="postcard-content-overlay">
              <div className="postcard-inner">
                <div className="postcard-logo-badge">Logo</div>
                
                <h2 className="postcard-business-name">{businessData.name}</h2>
                
                <h1 className="postcard-main-offer">{businessData.offer}</h1>
                
                <p className="postcard-tagline">{businessData.tagline}</p>
                
                <p className="postcard-cta">{businessData.callToAction}</p>
                
                <div className="postcard-contact-info">
                  <p>{businessData.address1}</p>
                  <p>{businessData.address2}</p>
                  <p>{businessData.website}</p>
                </div>
              </div>
              
              <p className="postcard-footer-text">{businessData.footer}</p>
            </div>
          </>
        )}
      </div>
      
      <button 
        className="preview-nav next" 
        onClick={onNext}
        disabled={!canGoNext}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  );
};

export default PostcardPreviewEnhanced;