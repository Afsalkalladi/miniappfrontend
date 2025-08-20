import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import LoadingScreen from '../common/LoadingScreen';
import ErrorScreen from '../common/ErrorScreen';
import StudentLogin from './StudentLogin';
import StudentRegistration from './StudentRegistration';
import StudentPendingApproval from './StudentPendingApproval';
import StudentDashboard from './StudentDashboard';

const StudentApp = ({ telegramUser }) => {
  const [appState, setAppState] = useState({
    isLoading: true,
    error: null,
    currentScreen: 'loading', // loading, login, registration, pending, dashboard
    user: null,
    registrationData: null
  });

  console.log('🎓 StudentApp component loaded');
  console.log('👤 Telegram user:', telegramUser);

  useEffect(() => {
    initializeStudentApp();
  }, []);

  const initializeStudentApp = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔄 Initializing student app...');
      
      // Check if user has existing auth token
      const existingToken = localStorage.getItem('auth_token');
      if (existingToken) {
        console.log('🔑 Found existing auth token, checking validity...');
        
        try {
          // Try to get user profile with existing token
          const profileResponse = await apiService.auth.getProfile();
          console.log('✅ Existing token valid, user profile:', profileResponse.data);
          
          setAppState(prev => ({
            ...prev,
            isLoading: false,
            currentScreen: 'dashboard',
            user: profileResponse.data
          }));
          return;
        } catch (error) {
          console.log('❌ Existing token invalid, removing...');
          localStorage.removeItem('auth_token');
        }
      }
      
      // No valid token, start with login
      console.log('🔐 No valid token, showing login screen');
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        currentScreen: 'login'
      }));
      
    } catch (error) {
      console.error('❌ Failed to initialize student app:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize app. Please try again.'
      }));
    }
  };

  const handleLoginSuccess = async (loginData) => {
    try {
      console.log('✅ Login successful:', loginData);
      
      // Store auth token
      if (loginData.token) {
        localStorage.setItem('auth_token', loginData.token);
      }
      
      setAppState(prev => ({
        ...prev,
        currentScreen: 'dashboard',
        user: loginData.user
      }));
      
    } catch (error) {
      console.error('❌ Login success handler failed:', error);
      setAppState(prev => ({
        ...prev,
        error: 'Login processing failed. Please try again.'
      }));
    }
  };

  const handleNeedsRegistration = () => {
    console.log('📝 User needs registration');
    setAppState(prev => ({
      ...prev,
      currentScreen: 'registration'
    }));
  };

  const handleRegistrationSuccess = (registrationData) => {
    console.log('✅ Registration successful:', registrationData);
    setAppState(prev => ({
      ...prev,
      currentScreen: 'pending',
      registrationData
    }));
  };

  const handleRetry = () => {
    console.log('🔄 Retrying initialization...');
    initializeStudentApp();
  };

  // Loading screen
  if (appState.isLoading) {
    return <LoadingScreen message="Loading student app..." />;
  }

  // Error screen
  if (appState.error) {
    return <ErrorScreen error={appState.error} onRetry={handleRetry} />;
  }

  // Render appropriate screen based on current state
  switch (appState.currentScreen) {
    case 'login':
      return (
        <StudentLogin
          telegramUser={telegramUser}
          onLoginSuccess={handleLoginSuccess}
          onNeedsRegistration={handleNeedsRegistration}
        />
      );

    case 'registration':
      return (
        <StudentRegistration
          telegramUser={telegramUser}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      );

    case 'pending':
      return (
        <StudentPendingApproval
          registrationData={appState.registrationData}
        />
      );

    case 'dashboard':
      return (
        <StudentDashboard
          user={appState.user}
        />
      );

    default:
      return (
        <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-telegram-text mb-4">Unknown State</h1>
            <p className="text-telegram-hint mb-4">Current screen: {appState.currentScreen}</p>
            <button
              onClick={handleRetry}
              className="bg-telegram-accent text-white px-4 py-2 rounded-lg"
            >
              Restart App
            </button>
          </div>
        </div>
      );
  }
};

export default StudentApp;
