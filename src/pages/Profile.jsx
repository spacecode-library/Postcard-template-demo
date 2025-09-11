import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import { mockUserProfile } from '../services/mockData';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setProfileData(formData);
    setIsEditing(false);
    // Here you would typically make an API call to save the data
    console.log('Profile updated:', formData);
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
          <div className="profile-actions">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-initials">
                    {formData.firstName[0]}{formData.lastName[0]}
                  </span>
                </div>
              )}
              {isEditing && (
                <div className="avatar-upload">
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="avatar-input"
                  />
                  <label htmlFor="avatar-upload" className="avatar-label">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 12V6M10 6L7 9M10 6L13 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 13V15C17 16.6569 15.6569 18 14 18H6C4.34315 18 3 16.6569 3 15V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Upload Photo
                  </label>
                </div>
              )}
            </div>
            <div className="avatar-info">
              <h2 className="user-full-name">{formData.firstName} {formData.lastName}</h2>
              <p className="user-role">{formData.role}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="form-section">
              <h3 className="section-title">Work Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Role</label>
                  <input 
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input 
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="form-section">
              <h3 className="section-title">Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Timezone</label>
                  <select 
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="form-section">
              <h3 className="section-title">Security</h3>
              <div className="security-options">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={formData.twoFactorEnabled}
                      onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                      disabled={!isEditing}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="security-item">
                  <div className="security-info">
                    <h4>Change Password</h4>
                    <p>Update your password regularly to keep your account secure</p>
                  </div>
                  <button className="btn-secondary" disabled={!isEditing}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;