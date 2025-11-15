import React from 'react';

export function Checkbox({ checked, onCheckedChange, className = '', id, ...props }) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={`h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 ${className}`}
        {...props}
      />
    </div>
  );
}