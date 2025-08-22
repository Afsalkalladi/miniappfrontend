import React from 'react';

const FormField = ({ 
  label,
  children,
  error,
  required = false,
  icon = null,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {label && (
        <label className="block text-telegram-text font-medium">
          {icon && <span className="w-4 h-4 inline mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

const Input = ({ 
  type = 'text',
  className = '',
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full bg-telegram-bg border rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:outline-none focus:ring-2 focus:ring-telegram-accent/50 transition-colors';
  const errorClasses = error ? 'border-red-400' : 'border-gray-600';
  
  return (
    <input 
      type={type}
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  );
};

const Select = ({ 
  children,
  className = '',
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full bg-telegram-bg border rounded-lg px-4 py-3 text-telegram-text focus:outline-none focus:ring-2 focus:ring-telegram-accent/50 transition-colors';
  const errorClasses = error ? 'border-red-400' : 'border-gray-600';
  
  return (
    <select 
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

const Textarea = ({ 
  className = '',
  error = false,
  rows = 3,
  ...props 
}) => {
  const baseClasses = 'w-full bg-telegram-bg border rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:outline-none focus:ring-2 focus:ring-telegram-accent/50 transition-colors resize-vertical';
  const errorClasses = error ? 'border-red-400' : 'border-gray-600';
  
  return (
    <textarea 
      rows={rows}
      className={`${baseClasses} ${errorClasses} ${className}`}
      {...props}
    />
  );
};

const Checkbox = ({ 
  label,
  className = '',
  ...props 
}) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="rounded border-gray-600 bg-telegram-bg text-telegram-accent focus:ring-telegram-accent/50"
        {...props}
      />
      {label && <span className="text-telegram-text">{label}</span>}
    </label>
  );
};

export { FormField, Input, Select, Textarea, Checkbox };
