import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Alert = ({ 
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  ...props 
}) => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon
  };

  const variants = {
    success: 'bg-green-500/20 border-green-500 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400'
  };

  const Icon = icons[type];
  
  return (
    <div className={`border rounded-lg p-4 ${variants[type]} ${className}`} {...props}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/20 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
