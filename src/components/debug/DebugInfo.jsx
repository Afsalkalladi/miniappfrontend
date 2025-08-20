import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const DebugInfo = () => {
  const authState = useAuthStore();
  
  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 Debug Information</h1>
        
        <div className="space-y-4">
          {/* Telegram WebApp Info */}
          <div className="bg-telegram-secondary p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Telegram WebApp</h2>
            <div className="space-y-1 text-sm">
              <div>Available: {window.Telegram?.WebApp ? '✅ Yes' : '❌ No'}</div>
              <div>User ID: {window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'Not found'}</div>
              <div>Username: {window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'Not found'}</div>
              <div>First Name: {window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Not found'}</div>
            </div>
          </div>

          {/* Auth Store State */}
          <div className="bg-telegram-secondary p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Auth Store State</h2>
            <pre className="text-xs bg-telegram-bg p-2 rounded overflow-auto">
              {JSON.stringify(authState, null, 2)}
            </pre>
          </div>

          {/* Environment Info */}
          <div className="bg-telegram-secondary p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Environment</h2>
            <div className="space-y-1 text-sm">
              <div>User Agent: {navigator.userAgent}</div>
              <div>URL: {window.location.href}</div>
              <div>Referrer: {document.referrer || 'None'}</div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-telegram-secondary p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const mockUser = {
                    id: 5469651459,
                    first_name: 'Debug',
                    last_name: 'User',
                    username: 'debuguser'
                  };
                  authState.initializeUser(mockUser);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Test Mock User Login
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
