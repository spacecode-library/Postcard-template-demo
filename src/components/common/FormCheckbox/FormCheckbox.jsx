import React from 'react';
import './FormCheckbox.css';

const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  helpText,
  disabled = false,
  className = '',
  ...props
}) => {
  const checkboxId = name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`checkbox-group ${className}`}>
      <label htmlFor={checkboxId} className={`checkbox-label ${disabled ? 'disabled' : ''}`}>
        <input
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="checkbox-input"
          {...props}
        />
        
        <span className="checkbox-box">
          <svg className="checkbox-icon" viewBox="0 0 16 16" fill="none">
            <path 
              d="M3 8L6 11L13 4" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
        
        {label && <span className="checkbox-text">{label}</span>}
      </label>
      
      {error && <span className="input-error">{error}</span>}
      {helpText && !error && <span className="input-help">{helpText}</span>}
    </div>
  );
};

export default FormCheckbox;