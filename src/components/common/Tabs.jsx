import React from 'react';
import { motion } from 'framer-motion';
import './Tabs.css';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <motion.button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab}
        </motion.button>
      ))}
    </div>
  );
};

export default Tabs;