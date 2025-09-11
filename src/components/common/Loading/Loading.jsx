import React from 'react';
import './Loading.css';

const Loading = ({ 
  size = 'medium', 
  fullScreen = false,
  text = 'Loading...',
  showText = true,
  className = '' 
}) => {
  const content = (
    <div className={`loading-container loading-${size} ${className}`}>
      <div className="loading-spinner">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="spinner-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          />
          <circle
            className="spinner-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          />
        </svg>
      </div>
      {showText && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;