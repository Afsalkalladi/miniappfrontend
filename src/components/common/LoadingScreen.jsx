import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent mx-auto mb-4"></div>
        <div className="text-telegram-text text-lg font-medium">Loading...</div>
        <div className="text-telegram-hint text-sm mt-2">Initializing Mess Management System</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
