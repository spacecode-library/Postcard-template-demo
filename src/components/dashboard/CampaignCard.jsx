import React from 'react';
import './CampaignCard.css';

const CampaignCard = ({ campaign, onToggleStatus, onEdit, onDelete, onDuplicate }) => {
  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <div className="campaign-status-section">
          <div className="toggle-wrapper">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={campaign.isActive}
                onChange={() => onToggleStatus(campaign.id)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="status-text">
              {campaign.isActive ? 'Active' : 'Paused'}
            </span>
          </div>
          <span className={`status-badge ${campaign.status.toLowerCase()}`}>
            • {campaign.status}
          </span>
        </div>
      </div>

      <h3 className="campaign-title">{campaign.name}</h3>

      <div className="campaign-image-container">
        <img 
          src={campaign.image} 
          alt={campaign.name}
          className="campaign-image"
        />
      </div>

      <div className="campaign-details">
        <div className="detail-item">
          <span className="detail-label">Target Area</span>
          <span className="detail-value">{campaign.targetArea}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Post card sent</span>
          <span className="detail-value">{campaign.postcardsSent}</span>
        </div>
      </div>

      <div className="campaign-actions">
        <button 
          className="edit-button"
          onClick={() => onEdit(campaign.id)}
        >
          Edit Campaign
        </button>
        <div className="action-buttons">
          <button 
            className="icon-button delete"
            onClick={() => onDelete(campaign.id)}
            title="Delete"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5H15M7 5V3.5C7 3.22386 7.22386 3 7.5 3H10.5C10.7761 3 11 3.22386 11 3.5V5M4 5L4.5 15C4.5 15.5523 4.94772 16 5.5 16H12.5C13.0523 16 13.5 15.5523 13.5 15L14 5" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            className="icon-button duplicate"
            onClick={() => onDuplicate(campaign.id)}
            title="Duplicate"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="7" y="7" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;