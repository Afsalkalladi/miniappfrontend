import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  HomeIcon,
  QrCodeIcon,
  CameraIcon,
  PencilIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentProfile = ({ onBack }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.getProfile();
      setProfile(response.data);
      setEditData({
        name: response.data.student?.name || '',
        mobile_number: response.data.student?.mobile_number || '',
        room_no: response.data.student?.room_no || '',
        is_sahara_inmate: response.data.student?.is_sahara_inmate || false
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await apiService.student.updateProfile(editData);
      
      alert('✅ Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    try {
      if (!confirm('Are you sure you want to regenerate your QR code? The old QR code will become invalid.')) {
        return;
      }

      setLoading(true);
      await apiService.student.regenerateQR();
      
      alert('✅ QR code regenerated successfully!');
      loadProfile();
    } catch (error) {
      console.error('Failed to regenerate QR:', error);
      alert(`Failed to regenerate QR code: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Error Loading Profile</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadProfile} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const student = profile?.student;
  const user = profile?.user;

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-telegram-text">My Profile</h1>
            <p className="text-telegram-hint">View and manage your profile</p>
          </div>
        </div>
        
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 bg-telegram-accent text-white px-4 py-2 rounded-lg hover:bg-telegram-accent/80"
        >
          <PencilIcon className="w-4 h-4" />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Profile Picture */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {student?.profile_image ? (
            <img 
              src={student.profile_image} 
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-telegram-accent"
            />
          ) : (
            <div className="w-24 h-24 bg-telegram-accent rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
          )}
          
          {editing && (
            <button className="absolute bottom-0 right-0 bg-telegram-accent text-white p-2 rounded-full hover:bg-telegram-accent/80">
              <CameraIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-telegram-text mt-3">
          {student?.name || `${user?.first_name} ${user?.last_name}`}
        </h2>
        
        {student?.is_approved ? (
          <span className="inline-block px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm mt-2">
            ✅ Approved
          </span>
        ) : (
          <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm mt-2">
            ⏳ Pending Approval
          </span>
        )}
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
