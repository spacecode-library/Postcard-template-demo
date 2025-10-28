import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Avatar Component
 * Displays user avatar with fallback to initials or icon
 * Supports different sizes and gradient backgrounds
 */
const Avatar = ({
  user,
  size = 'md',
  className,
  src,
  fallback
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  // Get user initials
  const getInitials = () => {
    if (fallback) return fallback;
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return names[0].charAt(0) + names[names.length - 1].charAt(0);
      }
      return names[0].charAt(0);
    }
    return null;
  };

  const imageUrl = src || user?.avatar || user?.profileImage;
  const initials = getInitials();

  return (
    <div className={cn(
      'rounded-full overflow-hidden flex items-center justify-center',
      'bg-gradient-to-br from-primary-400 to-primary-600',
      'text-white font-bold shadow-md',
      sizeClasses[size],
      className
    )}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={user?.name || 'User avatar'}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span>{initials.toUpperCase()}</span>
      ) : (
        <User size={iconSizes[size]} />
      )}
    </div>
  );
};

export default Avatar;
