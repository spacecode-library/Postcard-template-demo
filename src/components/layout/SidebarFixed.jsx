import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const SidebarFixed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar" style={{ display: 'flex !important' }}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container sidebar">
          <div className="logo-placeholder">
            [Logo Placeholder]
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search" className="search-input" />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {/* Dashboard */}
        <div 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 7.5L10 2.5L17 7.5V16.5C17 17.0523 16.5523 17.5 16 17.5H4C3.44772 17.5 3 17.0523 3 16.5V7.5Z" 
                stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
          <span className="nav-label">Dashboard</span>
          <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* History */}
        <div 
          className={`nav-item ${isActive('/history') ? 'active' : ''}`}
          onClick={() => navigate('/history')}
        >
          <span className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 5V10L13.5 13.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
          <span className="nav-label">History</span>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="sidebar-footer">
        {/* Settings */}
        <div 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 1V3M10 17V19M3.5 3.5L5.5 5.5M14.5 14.5L16.5 16.5M1 10H3M17 10H19M3.5 16.5L5.5 14.5M14.5 5.5L16.5 3.5" 
              stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="nav-label">Settings</span>
        </div>
        
        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            <div className="avatar-initials">OR</div>
            <div className="status-indicator"></div>
          </div>
          <div className="user-info">
            <div className="user-name">Olivia Rhye</div>
            <div className="user-email">user@company.com</div>
          </div>
          <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SidebarFixed;