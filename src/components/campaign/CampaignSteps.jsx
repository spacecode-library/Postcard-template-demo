import React from 'react';
import './CampaignSteps.css';

const CampaignSteps = ({ steps, currentStep }) => {
  return (
    <div className="campaign-steps">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const stepNumber = index + 1;
        
        return (
          <div 
            key={step.number} 
            className={`campaign-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-number">
              {isCompleted ? '✓' : stepNumber}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-subtitle">{step.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignSteps;