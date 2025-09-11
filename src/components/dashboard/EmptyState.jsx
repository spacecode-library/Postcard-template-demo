import React from 'react';
import './EmptyState.css';

const EmptyState = ({ onCreateCampaign }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-icon-wrapper">
          <svg className="empty-icon" width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="60" fill="#F3F4F6"/>
            <circle cx="60" cy="60" r="40" fill="#E5E7EB"/>
            <path d="M50 60H70M60 50V70" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="75" cy="75" r="12" fill="#D1D5DB"/>
            <circle cx="75" cy="75" r="8" fill="#9CA3AF"/>
            <path d="M80 80L88 88" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="empty-title">No Campaigns Yet!</h2>
        <p className="empty-subtitle">It's already easier to start your campaign</p>
        
        <button className="create-campaign-btn" onClick={onCreateCampaign}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V17M3 10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create Campaign
        </button>
      </div>
    </div>
  );
};

export default EmptyState;