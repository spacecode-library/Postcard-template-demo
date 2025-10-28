import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

/**
 * Unified Button Component
 *
 * Variants:
 * - primary: Main action buttons (teal/green)
 * - secondary: Less prominent actions (gray)
 * - outline: Bordered button with no fill
 * - ghost: Text-only button
 * - danger: Destructive actions (red)
 *
 * Sizes:
 * - sm: Small (height 36px)
 * - md: Medium (height 40px) - default
 * - lg: Large (height 48px)
 */

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const disabledClass = disabled || loading ? 'btn-disabled' : '';
  const classNames = [baseClass, variantClass, sizeClass, widthClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type={type}
      className={classNames}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    >
      {loading && (
        <div className="btn-spinner" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      <span className="btn-content">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </motion.button>
  );
};

export default Button;
