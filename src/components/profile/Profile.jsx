import React, { useEffect, useState } from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  HomeIcon,
  QrCodeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingQR, setRegeneratingQR] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      const response = await apiService.auth.getProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQRCode = async () => {
    try {
      setRegeneratingQR(true);
      // Add QR regeneration API call here when available
      // await apiService.student.regenerateQRCode();
      // await loadProfile(); // Reload profile to get new QR code
      alert('QR code regeneration feature will be available soon');
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      alert('Failed to regenerate QR code');
    } finally {
      setRegeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent mx-auto mb-4"></div>
          <p className="text-telegram-hint">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="bg-telegram-accent text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const student = userProfile?.student;
  const user = userProfile?.user;

  const profileItems = [
    {
      label: 'Name',
      value: student?.name || `${user?.first_name} ${user?.last_name}`,
      icon: UserIcon,
    },
    {
      label: 'Mess Number',
      value: student?.mess_no || 'Not assigned',
      icon: QrCodeIcon,
    },
    {
      label: 'Department',
      value: student?.department || 'Not specified',
      icon: BuildingOfficeIcon,
    },
    {
      label: 'Year of Study',
      value: student?.year_of_study || 'Not specified',
      icon: BuildingOfficeIcon,
    },
    {
      label: 'Room Number',
      value: student?.room_no || 'Not assigned',
      icon: HomeIcon,
    },
    {
      label: 'Mobile Number',
      value: student?.mobile_number || 'Not provided',
      icon: PhoneIcon,
    },
  ];

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">Profile</h1>
        <p className="text-telegram-hint">Your account information</p>
      </div>

      {/* Profile Picture */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-3">
          <UserIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-telegram-text">
          {student?.name}
        </h2>
        {student?.is_approved ? (
          <span className="inline-block px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm mt-2">
            Approved
          </span>
        ) : (
          <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm mt-2">
            Pending Approval
          </span>
        )}
      </div>

      {/* Profile Information */}
      <div className="card space-y-4">
        {profileItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 bg-telegram-bg rounded-lg">
              <item.icon className="w-5 h-5 text-telegram-hint" />
            </div>
            <div className="flex-1">
              <p className="text-telegram-hint text-sm">{item.label}</p>
              <p className="text-telegram-text font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Section */}
      {student?.qr_code && (
        <div className="card mt-6 text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">My QR Code</h3>
          <div className="bg-white p-4 rounded-lg inline-block">
            <img 
              src={student.qr_code} 
              alt="Student QR Code"
              className="w-32 h-32"
            />
          </div>
          <p className="text-telegram-hint text-sm mt-2">
            Show this QR code for attendance marking
          </p>
          <button
            onClick={regenerateQRCode}
            disabled={regeneratingQR}
            className="mt-4 flex items-center gap-2 bg-telegram-accent text-white px-4 py-2 rounded-lg mx-auto hover:bg-telegram-accent/80 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${regeneratingQR ? 'animate-spin' : ''}`} />
            {regeneratingQR ? 'Regenerating...' : 'Regenerate QR Code'}
          </button>
        </div>
      )}

      {/* No QR Code Message */}
      {student && !student.qr_code && (
        <div className="card mt-6 text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">QR Code</h3>
          <div className="bg-telegram-secondary p-6 rounded-lg">
            <QrCodeIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <p className="text-telegram-hint">QR code not generated yet</p>
            <p className="text-telegram-hint text-sm mt-1">Contact admin to generate your QR code</p>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem('auth_token');
          window.location.reload();
        }}
        className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;
