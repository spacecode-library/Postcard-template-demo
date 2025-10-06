import React from 'react';
import './TemplateCardSkeleton.css';

const TemplateCardSkeleton = () => {
  return (
    <div className="template-card-skeleton">
      <div className="skeleton-image skeleton-animate"></div>
      <div className="skeleton-content">
        <div className="skeleton-title skeleton-animate"></div>
        <div className="skeleton-meta">
          <div className="skeleton-text skeleton-animate" style={{ width: '60%' }}></div>
        </div>
        <div className="skeleton-button skeleton-animate"></div>
      </div>
    </div>
  );
};

export default TemplateCardSkeleton;
