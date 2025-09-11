import React from 'react';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="loader-spinner"></div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default PageLoader;