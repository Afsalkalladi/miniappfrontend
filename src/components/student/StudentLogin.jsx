import React, { useState } from 'react';
import { UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentLogin = ({ telegramUser, onLoginSuccess, onNeedsRegistration }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('👤 StudentLogin component loaded');
  console.log('📱 Telegram user:', telegramUser);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Attempting student login...');

      // Real API call to backend
      const loginData = {
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username || '',
        first_name: telegramUser.first_name || '',
        last_name: telegramUser.last_name || ''
      };

      console.log('📤 Sending login data:', loginData);

      const response = await apiService.auth.loginWithTelegram(loginData);
      console.log('📥 Login response:', response.data);

      if (response.data.needs_registration) {
        console.log('📝 User needs registration');
        onNeedsRegistration();
      } else {
        console.log('✅ Login successful');
        onLoginSuccess(response.data);
      }

    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Student Login
          </h1>
          <p className="text-telegram-hint">
            Welcome to Mess Management System
          </p>
        </div>

        {/* User Info */}
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
          <h3 className="text-telegram-text font-medium mb-4">Telegram Account</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-telegram-hint">Name:</span>
              <span className="text-telegram-text">
                {telegramUser?.first_name} {telegramUser?.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-telegram-hint">Username:</span>
              <span className="text-telegram-text">
                @{telegramUser?.username || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-telegram-hint">ID:</span>
              <span className="text-telegram-text font-mono text-sm">
                {telegramUser?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-telegram-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-telegram-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Logging in...
            </>
          ) : (
            <>
              Continue as Student
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h4 className="text-telegram-text font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Component: StudentLogin</div>
            <div>Telegram ID: {telegramUser?.id || 'Missing'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Error: {error || 'None'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;
