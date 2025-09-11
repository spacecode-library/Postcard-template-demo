import React from 'react';
import './FormInput.css';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`input-wrapper ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}>
        {icon && <div className="input-icon">{icon}</div>}
        
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`form-input ${inputClassName}`}
          {...props}
        />
      </div>
      
      {error && <span className="input-error">{error}</span>}
      {helpText && !error && <span className="input-help">{helpText}</span>}
    </div>
  );
};

export default FormInput;