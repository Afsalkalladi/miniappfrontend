import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  HomeIcon,
  QrCodeIcon,
  ArrowRightOnRectangleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentProfile = ({ user, telegramUser, showToast }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [regeneratingQR, setRegeneratingQR] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.students.getProfile();
      setProfileData(response);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!confirm('Are you sure you want to regenerate your QR code? This will invalidate your current QR code.')) {
      return;
    }

    try {
      setRegeneratingQR(true);
      
      const response = await apiService.students.regenerateQR();
      
      // Update profile data with new QR
      setProfileData(prev => ({
        ...prev,
        qr_code: response.qr_code
      }));
      
      showToast('QR code regenerated successfully', 'success');
      
    } catch (error) {
      console.error('QR regeneration error:', error);
      showToast('Failed to regenerate QR code', 'error');
    } finally {
      setRegeneratingQR(false);
    }
  };

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

  if (loading || isLoggingOut) {
    return (
      <div className="p-4">
        <LoadingSpinner text={isLoggingOut ? "Logging out..." : "Loading profile..."} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-600 font-medium mb-2">Error Loading Profile</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button 
            onClick={loadProfile} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const student = profileData;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your profile</p>
        </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full overflow-hidden border-2 border-blue-200">
            {student?.profile_picture ? (
              <img src={student.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircleIcon className="w-10 h-10 text-blue-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {student?.name || user?.first_name}
            </h2>
            <p className="text-gray-600">Student</p>
            <div className="flex items-center gap-2 mt-1">
              {student?.is_approved ? (
                <span className="text-sm text-green-600 font-medium">✅ Approved</span>
              ) : (
                <span className="text-sm text-yellow-600 font-medium">⏳ Pending Approval</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Mess Number</span>
            <span className="text-gray-900 font-medium font-mono">{student?.mess_no || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Department</span>
            <span className="text-gray-900 font-medium">{student?.department || 'Not specified'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Year of Study</span>
            <span className="text-gray-900 font-medium">{student?.year_of_study || 'Not specified'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Mobile</span>
            <span className="text-gray-900 font-medium">{student?.mobile_number || 'Not provided'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Room Number</span>
            <span className="text-gray-900 font-medium">{student?.room_no || 'Not assigned'}</span>
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

      {/* QR Code Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My QR Code</h3>
        {student?.qr_code ? (
          <>
            <div className="bg-gray-50 p-4 rounded-lg inline-block mb-4">
              <img 
                src={student.qr_code} 
                alt="Student QR Code"
                className="w-32 h-32"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Show this QR code for mess entry
            </p>
            <button
              onClick={handleRegenerateQR}
              disabled={regeneratingQR}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regeneratingQR ? 'Regenerating...' : 'Regenerate QR Code'}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No QR code generated yet</p>
            <button
              onClick={handleRegenerateQR}
              disabled={regeneratingQR}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regeneratingQR ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        )}
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
            <span className="text-gray-900 font-medium">Student</span>
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
    </div>
  );
};

export default StudentProfile;
