import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  title = 'Error', 
  message, 
  type = 'error',
  onRetry,
  onDismiss,
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.62 19 21.66 17.23 20.81 15.77L13.88 3.23C13.04 1.78 10.96 1.78 10.12 3.23L3.19 15.77C2.34 17.23 3.38 19 5.07 19Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className={`error-message error-message-${type} ${className}`}>
      <div className="error-icon">
        {getIcon()}
      </div>
      <div className="error-content">
        <h4 className="error-title">{title}</h4>
        {message && <p className="error-text">{message}</p>}
      </div>
      <div className="error-actions">
        {onRetry && (
          <button className="error-action-btn" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button className="error-close-btn" onClick={onDismiss} aria-label="Dismiss">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;