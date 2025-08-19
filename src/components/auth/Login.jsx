import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const Login = () => {
  const { error, clearError } = useAuthStore();

  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-telegram-text mb-2">
            Mess Management
          </h1>
          <p className="text-telegram-hint">
            Welcome to your mess management system
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-700">
          <p className="text-telegram-text mb-4">
            Please open this app through Telegram to continue.
          </p>
          <p className="text-telegram-hint text-sm">
            This app requires Telegram authentication to function properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
