import React from 'react';
import './FormInput.css';

/**
 * Unified Form Input Component
 *
 * Props:
 * - label: Input label
 * - error: Error message to display
 * - helper: Helper text below input
 * - required: Show required indicator
 * - icon: Icon component to show (left side)
 * - All standard input props (type, placeholder, value, onChange, etc.)
 */

const FormInput = ({
  label,
  error,
  helper,
  required = false,
  icon = null,
  className = '',
  ...inputProps
}) => {
  const hasError = Boolean(error);
  const wrapperClass = `form-input-wrapper ${className}`;
  const inputClass = `form-input ${hasError ? 'form-input-error' : ''} ${icon ? 'form-input-with-icon' : ''}`;

  return (
    <div className={wrapperClass}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <div className="form-input-container">
        {icon && <span className="form-input-icon">{icon}</span>}
        <input className={inputClass} {...inputProps} />
      </div>

      {error && <div className="form-error-message">{error}</div>}
      {!error && helper && <div className="form-helper-text">{helper}</div>}
    </div>
  );
};

export default FormInput;
