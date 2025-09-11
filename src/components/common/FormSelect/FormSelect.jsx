import React from 'react';
import './FormSelect.css';

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`select-wrapper ${error ? 'has-error' : ''}`}>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className="form-select"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="select-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {error && <span className="input-error">{error}</span>}
      {helpText && !error && <span className="input-help">{helpText}</span>}
    </div>
  );
};

export default FormSelect;