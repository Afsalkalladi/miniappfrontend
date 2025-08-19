import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

const TelegramOnly = () => {
  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <XCircleIcon className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-telegram-text mb-2">
            Access Denied
          </h1>
          <p className="text-telegram-hint">
            This application can only be accessed through Telegram
          </p>
        </div>

        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-700">
          <h2 className="text-telegram-text text-lg font-semibold mb-3">
            How to Access:
          </h2>
          <ol className="text-telegram-hint text-left space-y-2">
            <li>1. Open Telegram app</li>
            <li>2. Search for our bot</li>
            <li>3. Click on the Mini App button</li>
            <li>4. Use the app within Telegram</li>
          </ol>
        </div>

        <div className="mt-6">
          <p className="text-telegram-hint text-sm">
            For security reasons, this application requires Telegram authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramOnly;
