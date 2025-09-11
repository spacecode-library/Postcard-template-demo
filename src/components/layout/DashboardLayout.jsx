import React from 'react';
import Sidebar from './Sidebar';
import SidebarFixed from './SidebarFixed';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  // Using SidebarFixed temporarily to debug the issue
  const UseSidebar = Sidebar; // Change to SidebarFixed if original doesn't work
  
  return (
    <div className="dashboard-layout">
      <UseSidebar />
      <div className="dashboard-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;