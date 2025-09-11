import React from 'react';
import './EngagementValue.css';

const EngagementValue = ({ value }) => {
  const isPositive = value > 0;
  const className = isPositive ? 'engagement-positive' : 'engagement-negative';
  const displayValue = isPositive ? `+${value}` : value.toString();

  return (
    <span className={`engagement-value ${className}`}>
      {displayValue}
    </span>
  );
};

export default EngagementValue;