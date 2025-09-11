import React, { useState } from 'react';
import './ProfileTab.css';

const ProfileTab = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: 'Oliva',
    lastName: 'Rhye',
    email: 'olivia@untitledui.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDangerWarning, setShowDangerWarning] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAccount = () => {
    console.log('Delete account clicked...');
  };

  return (
    <div className="profile-tab">
      {/* Personal Info Section */}
      <div className="settings-section">
        <h2 className="section-title">Personal info</h2>
        
        <div className="form-row">
          <label className="form-label">
            Name <span className="required">*</span>
          </label>
          <div className="name-inputs">
            <input
              type="text"
              className="form-input"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="First name"
            />
            <input
              type="text"
              className="form-input"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">
            Email address <span className="required">*</span>
          </label>
          <div className="email-input-container">
            <svg className="email-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5L10 10L17 5M3 5V15C3 15.5523 3.44772 16 4 16H16C16.5523 16 17 15.5523 17 15V5M3 5C3 4.44772 3.44772 4 4 4H16C16.5523 4 17 4.44772 17 5" 
                stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <input
              type="email"
              className="form-input email-input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email address"
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="settings-section">
        <h2 className="section-title">Password</h2>
        <p className="section-description">
          Please enter your current password to change your password.
        </p>

        <div className="form-row">
          <label className="form-label">
            Current password <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-input"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-row">
          <label className="form-label">
            New password <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-input"
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            placeholder="••••••••"
          />
          <p className="password-hint">Your new password must be more than 8 characters.</p>
        </div>

        <div className="form-row">
          <label className="form-label">
            Confirm new password <span className="required">*</span>
          </label>
          <input
            type="password"
            className="form-input"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="settings-section danger-zone">
        <h2 className="section-title">Danger Zone</h2>
        <p className="section-description">
          Configuration for deactivate your account
        </p>

        {showDangerWarning && (
          <div className="danger-warning">
            <div className="warning-content">
              <p className="warning-text">
                Please be very careful to deactivate or delete your account. Check out the guidance{' '}
                <a href="#" className="warning-link">here</a>
              </p>
              <button 
                className="close-warning"
                onClick={() => setShowDangerWarning(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="form-row">
          <label className="form-label">
            Account deletion <span className="required">*</span>
          </label>
          <button 
            className="delete-account-button"
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="settings-footer">
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="save-button" onClick={() => onSave(formData)}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;