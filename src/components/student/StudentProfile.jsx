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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.students.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
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

  const student = profileData?.student;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View and manage your profile</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-10 h-10 text-blue-600" />
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

      {/* Profile Information */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <UserIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Full Name</p>
              {editing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-telegram-bg border border-gray-600 rounded px-3 py-1 text-telegram-text"
                />
              ) : (
                <p className="text-telegram-text font-medium">{student?.name || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Mess Number */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <QrCodeIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Mess Number</p>
              <p className="text-telegram-text font-medium font-mono">{student?.mess_no || 'Not assigned'}</p>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Department</p>
              <p className="text-telegram-text font-medium">{student?.department || 'Not specified'}</p>
            </div>
          </div>

          {/* Year of Study */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <BuildingOfficeIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Year of Study</p>
              <p className="text-telegram-text font-medium">{student?.year_of_study || 'Not specified'}</p>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <PhoneIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Mobile Number</p>
              {editing ? (
                <input
                  type="tel"
                  value={editData.mobile_number}
                  onChange={(e) => setEditData({...editData, mobile_number: e.target.value})}
                  className="w-full bg-telegram-bg border border-gray-600 rounded px-3 py-1 text-telegram-text"
                />
              ) : (
                <p className="text-telegram-text font-medium">{student?.mobile_number || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Room Number */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <HomeIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Room Number</p>
              {editing ? (
                <input
                  type="text"
                  value={editData.room_no}
                  onChange={(e) => setEditData({...editData, room_no: e.target.value})}
                  className="w-full bg-telegram-bg border border-gray-600 rounded px-3 py-1 text-telegram-text"
                />
              ) : (
                <p className="text-telegram-text font-medium">{student?.room_no || 'Not assigned'}</p>
              )}
            </div>
          </div>

          {/* Sahara Inmate */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <HomeIcon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">Sahara Hostel</p>
              {editing ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.is_sahara_inmate}
                    onChange={(e) => setEditData({...editData, is_sahara_inmate: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-telegram-text">Sahara Hostel Inmate</span>
                </label>
              ) : (
                <p className="text-telegram-text font-medium">
                  {student?.is_sahara_inmate ? 'Yes' : 'No'}
                </p>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex-1 btn-primary"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      {student?.qr_code && (
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">My QR Code</h3>
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            <img 
              src={student.qr_code} 
              alt="Student QR Code"
              className="w-32 h-32"
            />
          </div>
          <p className="text-telegram-hint text-sm mb-4">
            Show this QR code for attendance marking
          </p>
          <button
            onClick={handleRegenerateQR}
            className="btn-secondary"
          >
            Regenerate QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
