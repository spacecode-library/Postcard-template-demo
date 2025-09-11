import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'status-badge-sent';
      case 'draft':
        return 'status-badge-draft';
      case 'scheduled':
        return 'status-badge-scheduled';
      case 'in-progress':
        return 'status-badge-in-progress';
      default:
        return 'status-badge-default';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;