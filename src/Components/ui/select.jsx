import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

const SelectContext = createContext();

export function Select({ children, value, onValueChange }) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const triggerRef = useRef(null);

  const handleSelect = (val) => {
    setSelectedValue(val);
    setOpen(false);
    if (onValueChange) onValueChange(val);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ selectedValue, handleSelect, open, setOpen }}>
      <div className="relative" ref={triggerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = '', ...props }) {
  const { selectedValue, open, setOpen } = useContext(SelectContext);
  
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <span>{children || selectedValue}</span>
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { selectedValue } = useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ children, className = '' }) {
  const { open } = useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ children, value, className = '' }) {
  const { handleSelect, selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${
        isSelected ? 'bg-gray-100' : ''
      } ${className}`}
      onClick={() => handleSelect(value)}
    >
      {children}
    </div>
  );
}