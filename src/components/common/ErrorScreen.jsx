import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-telegram-hint mb-4">{error}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 bg-telegram-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-telegram-accent/80 transition-colors mx-auto"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
        
        <div className="text-telegram-hint text-sm">
          <p>If the problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
