import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/apiService';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  HomeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import BackButton from '../common/BackButton';

const Register = ({ telegramUser, onSuccess }) => {
  // Safety check for telegramUser
  const safeUser = telegramUser || {};

  const [formData, setFormData] = useState({
    name: `${safeUser.first_name || ''} ${safeUser.last_name || ''}`.trim() || 'User',
    department: '',
    year_of_study: '',
    mobile_number: '',
    room_no: '',
    is_sahara_inmate: false,
    has_claim: false,
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    { value: 'EEE', label: 'Electrical and Electronics Engineering' },
    { value: 'CSE', label: 'Computer Science and Engineering' },
    { value: 'ME', label: 'Mechanical Engineering' },
    { value: 'CE', label: 'Civil Engineering' },
    { value: 'SF', label: 'Safety and Fire Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'ECE', label: 'Electronics and Communication Engineering' },
    { value: 'Other', label: 'Other' },
  ];

  const years = [
    { value: '1', label: 'First Year' },
    { value: '2', label: 'Second Year' },
    { value: '3', label: 'Third Year' },
    { value: '4', label: 'Fourth Year' },
    { value: 'Other', label: 'Other' },
  ];

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Profile picture must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.department || !formData.mobile_number) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('telegram_id', safeUser.id?.toString() || '5469651459');
      submitData.append('username', safeUser.username || 'debuguser');
      submitData.append('first_name', safeUser.first_name || 'Debug');
      submitData.append('last_name', safeUser.last_name || 'User');
      submitData.append('name', formData.name);
      submitData.append('department', formData.department);
      submitData.append('year_of_study', formData.year_of_study);
      submitData.append('mobile_number', formData.mobile_number.replace(/\D/g, ''));
      submitData.append('room_no', formData.room_no);
      submitData.append('is_sahara_inmate', formData.is_sahara_inmate);
      submitData.append('has_claim', formData.has_claim);

      if (profilePicture) {
        submitData.append('profile_picture', profilePicture);
      }

      // Register new student
      const response = await apiService.auth.registerStudent(submitData);

      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      // Show success message and redirect to pending approval
      onSuccess(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');

      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton label="Back to Login" />
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Complete Registration
          </h1>
          <p className="text-telegram-hint">
            Please provide your details to access the mess management system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-telegram-text mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-telegram-text mb-2">
              <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="input"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-telegram-text mb-2">
              <AcademicCapIcon className="w-4 h-4 inline mr-2" />
              Year of Study
            </label>
            <select
              value={formData.year_of_study}
              onChange={(e) => handleInputChange('year_of_study', e.target.value)}
              className="input"
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-telegram-text mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
              className="input"
              placeholder="Enter mobile number"
              required
            />
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-telegram-text mb-2">
              <HomeIcon className="w-4 h-4 inline mr-2" />
              Room Number
            </label>
            <input
              type="text"
              value={formData.room_no}
              onChange={(e) => handleInputChange('room_no', e.target.value)}
              className="input"
              placeholder="Enter room number (if applicable)"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-telegram-text mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Profile Picture
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="block w-full text-sm text-telegram-text
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-telegram-accent file:text-white
                  hover:file:bg-telegram-accent/80
                  file:cursor-pointer cursor-pointer"
              />
              {profilePicturePreview && (
                <div className="flex justify-center">
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-telegram-accent"
                  />
                </div>
              )}
              <p className="text-telegram-hint text-xs">
                Optional. Max 5MB. JPG, PNG, or GIF format.
              </p>
            </div>
          </div>

          {/* Has Claim */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="has_claim"
              checked={formData.has_claim}
              onChange={(e) => handleInputChange('has_claim', e.target.checked)}
              className="w-4 h-4 text-telegram-accent bg-telegram-secondary border-gray-600 rounded focus:ring-telegram-accent"
            />
            <label htmlFor="has_claim" className="text-telegram-text">
              I have a claim or issue to report
            </label>
          </div>

          {/* Sahara Inmate */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sahara_inmate"
              checked={formData.is_sahara_inmate}
              onChange={(e) => handleInputChange('is_sahara_inmate', e.target.checked)}
              className="w-4 h-4 text-telegram-accent bg-telegram-secondary border-gray-600 rounded focus:ring-telegram-accent"
            />
            <label htmlFor="sahara_inmate" className="text-telegram-text">
              I am a Sahara hostel inmate
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-telegram-hint text-sm">
            Your registration will be reviewed by admin before activation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
