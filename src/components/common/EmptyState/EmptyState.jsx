import React from 'react';
import Button from '../Button';
import './EmptyState.css';

const EmptyState = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  className = ''
}) => {
  return (
    <div className={`empty-state empty-state-${variant} ${className}`}>
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="empty-state-title">{title}</h3>
      )}
      
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      
      {action && (
        <div className="empty-state-action">
          <Button
            variant={action.variant || 'primary'}
            size={action.size || 'medium'}
            onClick={action.onClick}
            icon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;