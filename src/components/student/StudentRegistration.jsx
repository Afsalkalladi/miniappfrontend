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
    mess_no: '',
    department: '',
    year_of_study: '',
    mobile_number: '',
    room_no: '',
    is_sahara_inmate: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      console.log('📤 Submitting registration...');
      console.log('📋 Registration data:', formData);

      // Validate required fields
      if (!formData.name || !formData.mess_no || !formData.department || !formData.mobile_number) {
        throw new Error('Please fill in all required fields');
      }

      // Real API call to backend
      const registrationData = {
        telegram_id: telegramUser.id.toString(),
        name: formData.name,
        mess_no: formData.mess_no,
        department: formData.department,
        year_of_study: formData.year_of_study,
        mobile_number: formData.mobile_number,
        room_no: formData.room_no,
        is_sahara_inmate: formData.is_sahara_inmate
      };

      console.log('📤 Sending registration data:', registrationData);

      const response = await apiService.auth.registerStudent(registrationData);
      console.log('✅ Registration successful:', response.data);

      onRegistrationSuccess(response.data.student);

    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error.response?.data?.error || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG'];

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
          </div>

          {/* Mess Number */}
          <div>
            <label className="block text-telegram-text mb-2">
              Mess Number *
            </label>
            <input
              type="text"
              value={formData.mess_no}
              onChange={(e) => handleInputChange('mess_no', e.target.value)}
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint focus:border-telegram-accent focus:outline-none"
              placeholder="e.g., 2021001"
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
              className="w-full bg-telegram-secondary border border-gray-600 rounded-lg px-4 py-3 text-telegram-text focus:border-telegram-accent focus:outline-none"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
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
            <div>Form Valid: {formData.name && formData.mess_no && formData.department && formData.mobile_number ? 'Yes' : 'No'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentRegistration;
