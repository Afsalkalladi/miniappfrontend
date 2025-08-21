import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UserCircleIcon,
  QrCodeIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const StaffProfile = ({ user, telegramUser, showToast }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    try {
      setIsLoggingOut(true);
      
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      showToast('Logged out successfully', 'success');
      
      // Reload the app
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed', 'error');
      setIsLoggingOut(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });
  };

  if (isLoggingOut) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Logging out..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Profile</h1>
        <p className="text-gray-600">Manage your staff account</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-10 h-10 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-600">Staff Member</p>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Scanner Access</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">User ID</span>
            <span className="text-gray-900 font-medium">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Username</span>
            <span className="text-gray-900 font-medium">{user?.username || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="text-gray-900 font-medium">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Staff Since</span>
            <span className="text-gray-900 font-medium">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Telegram Info */}
      {telegramUser && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-600" />
            Telegram Account
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Telegram ID</span>
              <span className="text-gray-900 font-medium">{telegramUser.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Username</span>
              <span className="text-gray-900 font-medium">@{telegramUser.username || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Name</span>
              <span className="text-gray-900 font-medium">
                {telegramUser.first_name} {telegramUser.last_name || ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-green-600" />
          Permissions
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCodeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">QR Scanner Access</span>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Enabled
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <span className="text-gray-900">Attendance Tracking</span>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Time</span>
            <span className="text-gray-900 font-medium">{getCurrentTime()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">App Version</span>
            <span className="text-gray-900 font-medium">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role</span>
            <span className="text-gray-900 font-medium">Staff</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};

export default StaffProfile;
