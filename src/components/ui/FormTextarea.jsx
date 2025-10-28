import React from 'react';
import './FormTextarea.css';

/**
 * Unified Form Textarea Component
 */

const FormTextarea = ({
  label,
  error,
  helper,
  required = false,
  rows = 4,
  className = '',
  ...textareaProps
}) => {
  const hasError = Boolean(error);
  const wrapperClass = `form-textarea-wrapper ${className}`;
  const textareaClass = `form-textarea ${hasError ? 'form-textarea-error' : ''}`;

  return (
    <div className={wrapperClass}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <textarea className={textareaClass} rows={rows} {...textareaProps} />

      {error && <div className="form-error-message">{error}</div>}
      {!error && helper && <div className="form-helper-text">{helper}</div>}
    </div>
  );
};

export default FormTextarea;
