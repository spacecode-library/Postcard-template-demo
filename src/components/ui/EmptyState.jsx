import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import './EmptyState.css';

/**
 * Unified Empty State Component
 *
 * Used for empty lists, no data, no results, etc.
 */

const EmptyState = ({
  icon = '📭',
  title = 'No data yet',
  description = 'Get started by creating your first item',
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <motion.div
      className={`empty-state ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="empty-state-actions">
          {actionLabel && (
            <Button
              variant="primary"
              size="lg"
              onClick={onAction}
              icon={actionIcon}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="lg"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
