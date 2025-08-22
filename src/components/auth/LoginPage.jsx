import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { showError, showSuccess } from '../../utils/errorHandler';
import { apiService } from '../../services/apiService';
import { LoginForm, StudentRegistrationForm } from './forms';

const LoginPage = () => {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  const handleLogin = async (telegramId) => {
    try {
      setLoading(true);
      const result = await login(telegramId);

      // Handle registration states
      if (result?.registration_status === 'needs_registration') {
        setRegistrationRequired(true);
        setTelegramUser({ id: result.telegram_id || telegramId });
        showSuccess('Welcome! Please complete your registration.');
        return;
      }
      if (result?.registration_status === 'pending_approval') {
        showSuccess('Registration submitted. Awaiting admin approval.');
        return;
      }

      // Logged-in user payload
      const user = result?.user;
      if (user) {
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          if (user.has_admin_access) {
            window.location.href = '/admin-dashboard';
          } else if (user.has_scanner_access) {
            window.location.href = '/staff-scanner';
          } else if (user.has_student_features) {
            window.location.href = '/student-portal';
          }
        }, 800);
      }
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (formData) => {
    try {
      setLoading(true);
      
      const fd = new FormData();
      fd.append('telegram_id', String(telegramUser?.id || ''));
      fd.append('name', formData.name);
      fd.append('department', formData.department);
      if (formData.year_of_study) fd.append('year_of_study', String(formData.year_of_study));
      fd.append('mobile_number', formData.mobile_number);
      if (formData.room_no) fd.append('room_no', formData.room_no);
      fd.append('is_sahara_inmate', formData.is_sahara_inmate ? '1' : '0');
      fd.append('has_claim', formData.has_claim ? '1' : '0');
      
      const response = await apiService.students.register(fd);
      
      setRegistrationSubmitted(true);
      setRegistrationRequired(false);
      showSuccess('Registration submitted. Waiting for admin approval.');
      
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Show registration form if needed
  if (registrationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <StudentRegistrationForm
          onRegister={handleRegistration}
          loading={loading}
          error={null}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mess Management System
          </h1>
          <p className="text-gray-600">
            Sign in with your Telegram ID
          </p>
        </div>

        <LoginForm
          onLogin={handleLogin}
          loading={loading}
          error={null}
        />

        {registrationSubmitted && (
          <div className="text-center">
            <p className="text-sm text-green-600">Registration submitted. Awaiting approval.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
