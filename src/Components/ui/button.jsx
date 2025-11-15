import React from 'react';

export function Button({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}