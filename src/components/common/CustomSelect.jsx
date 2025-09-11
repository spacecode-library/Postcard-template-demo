import React from 'react';
import './CustomSelect.css';

const CustomSelect = ({ 
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error = false,
  success = false,
  size = 'default',
  className = ''
}) => {
  const selectClasses = [
    'custom-select',
    size !== 'default' && `select-${size}`,
    error && 'error',
    success && 'success',
    !value && 'placeholder',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="custom-select-wrapper">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      <div className="select-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default CustomSelect;