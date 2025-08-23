import React from 'react';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const AdminProfile = ({ user, telegramUser, showToast }) => {
  const handleLogout = () => {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
          <p className="text-gray-600 mt-1">Account settings and information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {telegramUser?.first_name} {telegramUser?.last_name}
            </h3>
            <p className="text-gray-600">@{telegramUser?.username || 'N/A'}</p>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Admin Access</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Telegram ID</p>
              <p className="font-medium">{telegramUser?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Type</p>
              <p className="font-medium">Administrator</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Admin Access</p>
              <p className={`font-medium ${user?.has_admin_access ? 'text-green-600' : 'text-red-600'}`}>
                {user?.has_admin_access ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Scanner Access</p>
              <p className={`font-medium ${user?.has_scanner_access ? 'text-green-600' : 'text-red-600'}`}>
                {user?.has_scanner_access ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* System Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h4 className="font-medium text-gray-900 mb-3">System Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">App Version</span>
              <span className="font-medium">v1.0.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Login</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Server Time</span>
              <span className="font-medium">
                {new Date().toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour12: true
                })}
              </span>
            </div>
        </div>
        </div>

        {/* Logout Button */}
        <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        Logout
        </button>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Mess Management System</p>
          <p>Admin Panel Access</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
