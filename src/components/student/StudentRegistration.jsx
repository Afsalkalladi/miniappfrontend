import React, { useState } from 'react';
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  HomeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentRegistration = ({ telegramUser, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    name: `${telegramUser?.first_name || ''} ${telegramUser?.last_name || ''}`.trim(),
    department: '',
    year_of_study: '',
    mobile_number: '',
    room_no: '',
    is_sahara_inmate: false
  });
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Static options
  const departmentOptions = [
    'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI', 'DS', 'MBA', 'MCA', 'BSc', 'BCom', 'Other'
  ];
  const yearOptions = ['1', '2', '3', '4', '5'];

  console.log('📝 StudentRegistration component loaded');
  console.log('👤 Telegram user:', telegramUser);
  console.log('📋 Form data:', formData);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`📝 Updated ${field}:`, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Basic client validation: < 5MB and image/*
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Profile picture must be an image');
        return;
      }
    }
    setError(null);
    setProfilePicture(file);
    console.log('🖼️ Selected profile picture:', file?.name, file?.size);
  };

  const validate = () => {
    const errs = {};
    const name = (formData.name || '').trim();
    const dept = (formData.department || '').trim();
    const year = (formData.year_of_study || '').toString().trim();
    const mobile = (formData.mobile_number || '').trim();
    const room = (formData.room_no || '').trim();

    if (!name || name.length < 2) errs.name = 'Please enter your full name.';
    if (!dept || !departmentOptions.includes(dept)) errs.department = 'Select a valid department.';
    if (!year || !yearOptions.includes(year)) errs.year_of_study = 'Select a valid year of study (1-5).';
    if (!mobile || !/^\d{10}$/.test(mobile)) errs.mobile_number = 'Enter a valid 10-digit mobile number.';
    if (room && !/^[A-Za-z0-9\-\s]{1,10}$/.test(room)) errs.room_no = 'Room can be up to 10 letters/numbers.';
    if (!profilePicture) errs.profile_picture = 'Profile picture is required.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      console.log('📤 Submitting registration...');
      console.log('📋 Registration data:', formData);

      // Strong client-side validation
      const errs = validate();
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setError('Please correct the highlighted fields.');
        setLoading(false);
        return;
      }

      // Build FormData explicitly to control types and include file
      const fd = new FormData();
      const storedTg = localStorage.getItem('telegram_id');
      fd.append('telegram_id', String(telegramUser?.id || telegramUser?.telegram_id || storedTg || ''));
      fd.append('name', formData.name);
      fd.append('department', formData.department);
      if (formData.year_of_study) fd.append('year_of_study', String(formData.year_of_study));
      fd.append('mobile_number', formData.mobile_number);
      if (formData.room_no) fd.append('room_no', formData.room_no);
      // Booleans as '1'/'0' to satisfy Django BooleanField parsing
      fd.append('is_sahara_inmate', formData.is_sahara_inmate ? '1' : '0');
      if (profilePicture) fd.append('profile_picture', profilePicture);

      console.log('📤 Sending registration FormData (no headers set):', {
        telegram_id: fd.get('telegram_id'),
        name: fd.get('name'),
        department: fd.get('department'),
        year_of_study: fd.get('year_of_study'),
        mobile_number: fd.get('mobile_number'),
        room_no: fd.get('room_no'),
        is_sahara_inmate: fd.get('is_sahara_inmate'),
        profile_picture: profilePicture?.name
      });

      const response = await apiService.students.register(fd);
      console.log('✅ Registration successful:', response);

      onRegistrationSuccess(response.student || response?.data?.student || null);

    } catch (error) {
      console.error('❌ Registration failed:', error);
      const details = error?.details;
      if (error?.status === 400 && details && typeof details === 'object') {
        setFieldErrors(details);
        setError(details.error || details.detail || 'Please correct the highlighted fields.');
      } else {
        setError(details?.error || error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Student Registration
          </h1>
          <p className="text-telegram-hint">
            Please provide your details to access the mess system
          </p>
        </div>

        {/* Registration Form */}
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
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:border-telegram-accent focus:outline-none"
              placeholder="Enter your full name"
              required
            />
            {fieldErrors?.name && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : String(fieldErrors.name)}
              </p>
            )}
          </div>

          {/* Auto-generated Mess Number Info */}
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">📋 Mess Number</h4>
            <p className="text-blue-300 text-sm">
              Your mess number will be automatically generated after registration.
              You'll receive it once your registration is approved.
            </p>
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
              className="w-full bg-telegram-secondary text-telegram-text rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-telegram-accent"
            >
              <option value="">Select department</option>
              {departmentOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {fieldErrors?.department && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.department) ? fieldErrors.department[0] : String(fieldErrors.department)}
              </p>
            )}
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-telegram-text mb-2">
              Year of Study
            </label>
            <select
              value={formData.year_of_study}
              onChange={(e) => handleInputChange('year_of_study', e.target.value)}
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text focus:border-telegram-accent focus:outline-none"
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {fieldErrors?.year_of_study && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.year_of_study) ? fieldErrors.year_of_study[0] : String(fieldErrors.year_of_study)}
              </p>
            )}
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
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:border-telegram-accent focus:outline-none"
              placeholder="+91 9876543210"
              required
            />
            {fieldErrors?.mobile_number && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.mobile_number) ? fieldErrors.mobile_number[0] : String(fieldErrors.mobile_number)}
              </p>
            )}
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
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:border-telegram-accent focus:outline-none"
              placeholder="e.g., A-101"
            />
            {fieldErrors?.room_no && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.room_no) ? fieldErrors.room_no[0] : String(fieldErrors.room_no)}
              </p>
            )}
          </div>

          {/* Sahara Inmate */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sahara"
              checked={formData.is_sahara_inmate}
              onChange={(e) => handleInputChange('is_sahara_inmate', e.target.checked)}
              className="w-4 h-4 text-telegram-accent bg-telegram-secondary border-gray-600 rounded focus:ring-telegram-accent"
            />
            <label htmlFor="sahara" className="text-telegram-text">
              I am a Sahara Hostel inmate
            </label>
          </div>
          {fieldErrors?.is_sahara_inmate && (
            <p className="mt-1 text-sm text-red-400">
              {Array.isArray(fieldErrors.is_sahara_inmate) ? fieldErrors.is_sahara_inmate[0] : String(fieldErrors.is_sahara_inmate)}
            </p>
          )}

          {/* Profile Picture (required) */}
          <div>
            <label className="block text-telegram-text mb-2">Profile Picture *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-telegram-text"
              required
            />
            {profilePicture && (
              <p className="text-xs text-gray-400 mt-1">Selected: {profilePicture.name}</p>
            )}
            {fieldErrors?.profile_picture && (
              <p className="mt-1 text-sm text-red-400">
                {Array.isArray(fieldErrors.profile_picture) ? fieldErrors.profile_picture[0] : String(fieldErrors.profile_picture)}
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-telegram-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-telegram-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Registering...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Register
              </>
            )}
          </button>

        </form>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h4 className="text-telegram-text font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Component: StudentRegistration</div>
            <div>Telegram ID: {telegramUser?.id || 'Missing'}</div>
            <div>Form Valid: {formData.name && formData.department && formData.mobile_number ? 'Yes' : 'No'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentRegistration;
