import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'default',
  ...props 
}) => {
  const baseClasses = 'rounded-lg border';
  
  const variants = {
    default: 'bg-telegram-secondary border-gray-600',
    primary: 'bg-telegram-accent/10 border-telegram-accent/30',
    success: 'bg-green-500/20 border-green-500',
    error: 'bg-red-500/20 border-red-500',
    warning: 'bg-yellow-500/20 border-yellow-500'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6'
  };

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
