import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import LoadingScreen from '../common/LoadingScreen';
import ErrorScreen from '../common/ErrorScreen';
import BottomNavigation from '../common/BottomNavigation';
import { useToast } from '../common/Toast';
import StudentRegistration from './StudentRegistration';
import StudentPendingApproval from './StudentPendingApproval';
import StudentDashboard from './StudentDashboard';
import StudentMessCuts from './StudentMessCuts';
import StudentBills from './StudentBills';
import StudentProfile from './StudentProfile';

const StudentApp = ({ telegramUser, user, registrationStatus, studentData }) => {
  const [appState, setAppState] = useState({
    isLoading: false,
    error: null,
    currentScreen: 'loading',
    user: user,
    activeTab: 'dashboard'
  });

  const { showToast, ToastContainer } = useToast();

  console.log('🎓 StudentApp component loaded');
  console.log('👤 Telegram user:', telegramUser);

  useEffect(() => {
    initializeStudentApp();
  }, []);

  const initializeStudentApp = async () => {
    try {
      console.log('🔄 Initializing student app...');
      console.log('📊 Registration status:', registrationStatus);
      
      // Determine current screen based on registration status
      if (registrationStatus === 'needs_registration') {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          currentScreen: 'registration'
        }));
      } else if (registrationStatus === 'pending_approval') {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          currentScreen: 'pending',
          registrationData: studentData
        }));
      } else if (registrationStatus === 'approved' && user) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          currentScreen: 'dashboard',
          user: user
        }));
      } else {
        // Check registration status from API
        const response = await apiService.students.getRegistrationStatus();
        const status = response.data;
        
        if (!status.is_registered) {
          setAppState(prev => ({
            ...prev,
            isLoading: false,
            currentScreen: 'registration'
          }));
        } else if (!status.is_approved) {
          setAppState(prev => ({
            ...prev,
            isLoading: false,
            currentScreen: 'pending',
            registrationData: status.student
          }));
        } else {
          setAppState(prev => ({
            ...prev,
            isLoading: false,
            currentScreen: 'dashboard',
            user: status.student
          }));
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize student app:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize app. Please try again.'
      }));
    }
  };

  const handleRegistrationSuccess = (registrationData) => {
    console.log('✅ Registration successful:', registrationData);
    setAppState(prev => ({
      ...prev,
      currentScreen: 'pending',
      registrationData
    }));
    showToast('Registration submitted successfully!', 'success');
  };

  const renderContent = () => {
    switch (appState.activeTab) {
      case 'dashboard':
        return <StudentDashboard user={appState.user} showToast={showToast} />;
      case 'mess-cuts':
        return <StudentMessCuts user={appState.user} showToast={showToast} />;
      case 'bills':
        return <StudentBills user={appState.user} showToast={showToast} />;
      case 'profile':
        return <StudentProfile user={appState.user} telegramUser={telegramUser} showToast={showToast} />;
      default:
        return <StudentDashboard user={appState.user} showToast={showToast} />;
    }
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
    case 'registration':
      return (
        <StudentRegistration
          telegramUser={telegramUser}
          onRegistrationSuccess={handleRegistrationSuccess}
          showToast={showToast}
        />
      );

    case 'pending':
      return (
        <StudentPendingApproval
          registrationData={appState.registrationData}
          showToast={showToast}
        />
      );

    case 'dashboard':
      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          {renderContent()}
          <BottomNavigation 
            activeTab={appState.activeTab} 
            onTabChange={(tab) => setAppState(prev => ({ ...prev, activeTab: tab }))} 
            userType="student" 
          />
          <ToastContainer />
        </div>
      );

    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unknown State</h1>
            <p className="text-gray-600 mb-4">Current screen: {appState.currentScreen}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Restart App
            </button>
          </div>
        </div>
      );
  }
};

export default StudentApp;
