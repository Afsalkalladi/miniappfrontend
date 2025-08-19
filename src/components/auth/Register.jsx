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

const Register = ({ telegramUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: `${telegramUser.first_name} ${telegramUser.last_name}`.trim() || '',
    department: '',
    year_of_study: '',
    mobile_number: '',
    room_no: '',
    is_sahara_inmate: false,
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.department || !formData.mobile_number) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Register new student
      const response = await apiService.auth.registerStudent({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        ...formData,
        mobile_number: formData.mobile_number.replace(/\D/g, ''), // Remove non-digits
      });

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
