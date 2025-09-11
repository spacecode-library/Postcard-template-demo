import React from 'react';
import './Logo.css';

const Logo = ({ variant = 'default', className = '' }) => {
  return (
    <div className={`logo-container ${variant} ${className}`}>
      <div className="logo-placeholder">
        [Logo Placeholder]
      </div>
    </div>
  );
};

export default Logo;