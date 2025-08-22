import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { showError, showSuccess } from '../../utils/errorHandler';

const LoginPage = () => {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!telegramId.trim()) {
      showError('Please enter your Telegram ID');
      return;
    }

    try {
      setLoading(true);
      const user = await login(telegramId);
      showSuccess('Login successful! Redirecting...');
      
      // Role-based routing will be handled by the auth service
      setTimeout(() => {
        if (user.has_admin_access) {
          window.location.href = '/admin-dashboard';
        } else if (user.has_scanner_access) {
          window.location.href = '/staff-scanner';
        } else if (user.has_student_features) {
          window.location.href = '/student-portal';
        }
      }, 1000);
      
    } catch (error) {
      showError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Mess Management System
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in with your Telegram ID
            </p>
          </div>

          <div id="error-container" style={{ display: 'none' }}></div>
          <div id="success-container" style={{ display: 'none' }}></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="telegram-id" className="block text-sm font-medium text-gray-700 mb-2">
                Telegram ID
              </label>
              <input
                id="telegram-id"
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="Enter your Telegram ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have access? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
