import React from 'react';
import './LoadingSpinner.css';

/**
 * Unified Loading Spinner Component
 *
 * Variants:
 * - page: Full page centered spinner with message
 * - inline: Small inline spinner
 * - overlay: Spinner with backdrop overlay
 */

const LoadingSpinner = ({
  variant = 'page',
  message = 'Loading...',
  submessage = '',
  size = 'md'
}) => {
  if (variant === 'inline') {
    return (
      <div className={`loading-spinner-inline loading-spinner-${size}`}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content">
          <div className="spinner spinner-lg"></div>
          {message && <p className="loading-message">{message}</p>}
          {submessage && <p className="loading-submessage">{submessage}</p>}
        </div>
      </div>
    );
  }

  // Page variant (default)
  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="spinner spinner-lg"></div>
        {message && <h2 className="loading-message">{message}</h2>}
        {submessage && <p className="loading-submessage">{submessage}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
