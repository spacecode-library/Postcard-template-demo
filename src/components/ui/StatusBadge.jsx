import React from 'react';
import './StatusBadge.css';

/**
 * Unified Status Badge Component
 *
 * Status types:
 * - active: Green (campaign is running)
 * - draft: Gray (not yet launched)
 * - completed: Blue (finished successfully)
 * - paused: Yellow (temporarily stopped)
 * - failed: Red (encountered error)
 * - scheduled: Purple (scheduled for future)
 */

const StatusBadge = ({ status, className = '' }) => {
  const statusMap = {
    active: { label: 'Active', variant: 'success' },
    draft: { label: 'Draft', variant: 'default' },
    completed: { label: 'Completed', variant: 'info' },
    paused: { label: 'Paused', variant: 'warning' },
    failed: { label: 'Failed', variant: 'error' },
    scheduled: { label: 'Scheduled', variant: 'purple' },
    pending: { label: 'Pending', variant: 'warning' },
    cancelled: { label: 'Cancelled', variant: 'error' },
  };

  const statusInfo = statusMap[status?.toLowerCase()] || { label: status, variant: 'default' };
  const badgeClass = `status-badge status-badge-${statusInfo.variant} ${className}`;

  return (
    <span className={badgeClass}>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
