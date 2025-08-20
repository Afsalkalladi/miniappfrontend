import React from 'react';

const Login = ({ onRetry }) => {

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



        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-700">
          <h2 className="text-telegram-text text-lg font-semibold mb-4">
            Telegram Access Required
          </h2>
          <div className="space-y-3 text-sm">
            <p className="text-telegram-text">
              This app can only be accessed through Telegram Mini App.
            </p>
            <div className="bg-telegram-bg p-3 rounded">
              <p className="text-telegram-hint mb-2">How to access:</p>
              <ol className="text-telegram-hint space-y-1 text-xs">
                <li>1. Open Telegram app</li>
                <li>2. Search for our bot: <span className="text-telegram-accent">@testsaharamessbot</span></li>
                <li>3. Click "Start" or send /start</li>
                <li>4. Click the "Mini App" button</li>
                <li>5. Use the app within Telegram</li>
              </ol>
            </div>
            <p className="text-red-400 text-xs">
              ⚠️ Browser access is not supported for security reasons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
