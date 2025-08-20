import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BackButton = ({ to, label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-telegram-hint hover:text-telegram-text transition-colors ${className}`}
    >
      <ArrowLeftIcon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
