import React from 'react';

export function Badge({ children, className = '', variant = 'default', ...props }) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-500 text-white',
    outline: 'border border-gray-300 text-gray-900',
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}