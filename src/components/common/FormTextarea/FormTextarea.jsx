import React from 'react';
import './FormTextarea.css';

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  maxLength,
  error,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
  ...props
}) => {
  const textareaId = name || label?.toLowerCase().replace(/\s+/g, '-');
  const characterCount = value ? value.length : 0;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`textarea-wrapper ${error ? 'has-error' : ''}`}>
        <textarea
          id={textareaId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className="form-textarea"
          {...props}
        />
        
        {maxLength && (
          <div className="character-count">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
      
      {error && <span className="input-error">{error}</span>}
      {helpText && !error && <span className="input-help">{helpText}</span>}
    </div>
  );
};

export default FormTextarea;