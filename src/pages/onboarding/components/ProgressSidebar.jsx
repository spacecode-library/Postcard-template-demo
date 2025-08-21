import React from 'react'

const steps = [
  {
    number: 1,
    title: 'Enter URL',
    description: 'Your business website',
  },
  {
    number: 2,
    title: 'Select template',
    description: 'Choose a design',
  },
  {
    number: 3,
    title: 'Edit template',
    description: 'Customize your postcard',
  },
  {
    number: 4,
    title: 'Target audience',
    description: 'Define who receives your postcards',
  },
  {
    number: 5,
    title: 'Set budget',
    description: 'Choose your spending',
  },
  {
    number: 6,
    title: 'Review',
    description: 'Confirm your campaign',
  },
]

const ProgressSidebar = ({ currentStep }) => {
  return (
    <aside className="progress-sidebar">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        const isLast = index === steps.length - 1
        
        return (
          <div
            key={step.number}
            className={`progress-step ${!isActive && !isCompleted ? 'inactive' : ''}`}
          >
            <div className="connector-wrap">
              <div className={`step-icon ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {!isCompleted && <span>{step.number}</span>}
              </div>
              {!isLast && <div className={`connector-line ${isLast ? 'last' : ''}`} />}
            </div>
            
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        )
      })}
    </aside>
  )
}

export default ProgressSidebar