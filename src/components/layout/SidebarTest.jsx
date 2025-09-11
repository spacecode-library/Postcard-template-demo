import React from 'react';
import Sidebar from './Sidebar';
import './Sidebar.css';

const SidebarTest = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#f5f5f5',
      position: 'relative'
    }}>
      <Sidebar />
      <div style={{ 
        marginLeft: '280px', 
        padding: '20px',
        background: 'white',
        minHeight: '100vh'
      }}>
        <h1>Sidebar Test Page</h1>
        <p>If you can see this text and the sidebar on the left with:</p>
        <ul>
          <li>Logo placeholder (dark background)</li>
          <li>Search bar</li>
          <li>Dashboard menu item</li>
          <li>History menu item</li>
          <li>Settings at bottom</li>
          <li>User profile at bottom</li>
        </ul>
        <p>Then the sidebar is working correctly!</p>
      </div>
    </div>
  );
};

export default SidebarTest;