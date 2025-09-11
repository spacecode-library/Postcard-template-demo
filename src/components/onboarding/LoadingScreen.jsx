import React from 'react';

const LoadingScreen = ({ title, subtitle }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h2 className="loading-title">{title}</h2>
        <div className="loading-spinner"></div>
        <p className="loading-text">{subtitle}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;