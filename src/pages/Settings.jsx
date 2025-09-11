import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Tabs from '../components/common/Tabs';
import ProfileTab from '../components/settings/ProfileTab';
import BusinessTab from '../components/settings/BusinessTab';
import BillingTab from '../components/settings/BillingTab';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  
  const tabs = ['Profile', 'Business', 'Preferences', 'Billing'];

  const handleSaveChanges = (data) => {
    console.log('Saving changes...', data);
  };

  const handleCancel = () => {
    console.log('Cancelling changes...');
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <div className="settings-search">
            <div className="search-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search" className="search-input" />
              <kbd className="search-shortcut">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Tab Navigation */}
          <Tabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'Profile' && (
              <ProfileTab 
                onSave={handleSaveChanges}
                onCancel={handleCancel}
              />
            )}
            
            {activeTab === 'Business' && (
              <BusinessTab 
                onSave={handleSaveChanges}
                onCancel={handleCancel}
              />
            )}

            {activeTab === 'Preferences' && (
              <div className="placeholder-content">
                <h3>{activeTab}</h3>
                <p>{activeTab} settings coming soon...</p>
              </div>
            )}
            
            {activeTab === 'Billing' && (
              <BillingTab />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;