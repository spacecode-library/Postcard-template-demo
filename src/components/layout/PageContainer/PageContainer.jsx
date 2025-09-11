import React from 'react';
import './PageContainer.css';

const PageContainer = ({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '',
  maxWidth = 'default',
  ...props 
}) => {
  return (
    <div className={`page-container page-container-${maxWidth} ${className}`} {...props}>
      {(title || subtitle || actions) && (
        <div className="page-header">
          <div className="page-header-content">
            {title && <h1 className="page-title">{title}</h1>}
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div className="page-header-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;