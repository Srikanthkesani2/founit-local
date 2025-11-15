import React, { useState } from 'react';

export function AlertDialog({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  return (
    <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

const AlertDialogContext = React.createContext();

export function AlertDialogTrigger({ children, asChild }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => setIsOpen(true) });
  }
  
  return (
    <button onClick={() => setIsOpen(true)}>
      {children}
    </button>
  );
}

export function AlertDialogContent({ children, className = '' }) {
  const { isOpen, setIsOpen } = React.useContext(AlertDialogContext);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className={`relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children, className = '' }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>;
}

export function AlertDialogTitle({ children, className = '' }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className = '' }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}

export function AlertDialogFooter({ children, className = '' }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>;
}

export function AlertDialogCancel({ children, onClick, className = '' }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  return (
    <button
      className={`mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 sm:mt-0 ${className}`}
      onClick={() => {
        setIsOpen(false);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({ children, onClick, className = '' }) {
  const { setIsOpen } = React.useContext(AlertDialogContext);
  
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${className}`}
      onClick={() => {
        onClick?.();
        setIsOpen(false);
      }}
    >
      {children}
    </button>
  );
}