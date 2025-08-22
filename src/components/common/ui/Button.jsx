import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-telegram-accent text-white hover:bg-telegram-accent/80 focus:ring-telegram-accent/50',
    secondary: 'bg-telegram-secondary text-telegram-text border border-gray-600 hover:bg-gray-600',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/50',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50',
    ghost: 'text-telegram-text hover:bg-telegram-secondary/50',
    outline: 'border border-telegram-accent text-telegram-accent hover:bg-telegram-accent hover:text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
