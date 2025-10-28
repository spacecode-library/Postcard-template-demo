import React from 'react';
import './FormSelect.css';

/**
 * Unified Form Select Component
 */

const FormSelect = ({
  label,
  error,
  helper,
  required = false,
  options = [],
  placeholder = 'Please select...',
  className = '',
  ...selectProps
}) => {
  const hasError = Boolean(error);
  const wrapperClass = `form-select-wrapper ${className}`;
  const selectClass = `form-select ${hasError ? 'form-select-error' : ''}`;

  return (
    <div className={wrapperClass}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <select className={selectClass} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <div className="form-error-message">{error}</div>}
      {!error && helper && <div className="form-helper-text">{helper}</div>}
    </div>
  );
};

export default FormSelect;
