import React, { useEffect, useState } from 'react';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorScreen from './components/common/ErrorScreen';
import TelegramOnly from './components/common/TelegramOnly';
import AdminPanel from './components/admin/AdminPanel';
import StaffPanel from './components/staff/StaffPanel';
import StudentApp from './components/student/StudentApp';

// Services
import { apiService } from './services/apiService';

function App() {
  const [appState, setAppState] = useState({
    isLoading: true,
    error: null,
    isInTelegram: false,
    telegramUser: null,
    user: null,
    isStudentFlow: false,
    userType: null,
    registrationStatus: null,
    studentData: null,
    showAccessDenied: false,
    canRegisterAsStudent: false
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');

      // Check if running in Telegram
      const isInTelegram = !!(window.Telegram?.WebApp);
      const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

      console.log('📱 Telegram check:', { isInTelegram, telegramUser });

      if (!isInTelegram) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: false,
          error: 'This app only works in Telegram'
        }));
        return;
      }

      if (!telegramUser?.id) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          error: 'No Telegram user data found'
        }));
        return;
      }

      // Initialize Telegram WebApp
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set theme colors (with version check)
      try {
        tg.setHeaderColor('#17212b');
        tg.setBackgroundColor('#17212b');
      } catch (e) {
        console.warn('Theme colors not supported in this Telegram version');
      }

      // Try to authenticate user
      await authenticateUser(telegramUser);

    } catch (error) {
      console.error('❌ App initialization error:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: `Initialization failed: ${error.message}`
      }));
    }
  };

  const authenticateUser = async (telegramUser) => {
    try {
      console.log('🔐 Authenticating user:', telegramUser);

      const response = await apiService.auth.loginWithTelegram({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username || '',
        first_name: telegramUser.first_name || '',
        last_name: telegramUser.last_name || ''
      });

      console.log('✅ Auth response:', response.data);

      // Handle different response types based on new backend structure
      if (response.status === 403) {
        // Access denied - not whitelisted for admin/staff
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: response.data.error,
          showAccessDenied: true,
          canRegisterAsStudent: response.data.can_register_as_student
        }));
        return;
      }

      if (response.data.registration_status === 'needs_registration') {
        // Student needs to register
        console.log('👨‍🎓 Student registration required');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user: null,
          isStudentFlow: true,
          registrationStatus: 'needs_registration'
        }));
        return;
      }

      if (response.data.registration_status === 'pending_approval') {
        // Student registration pending
        console.log('⏳ Student registration pending approval');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user: null,
          isStudentFlow: true,
          registrationStatus: 'pending_approval',
          studentData: response.data.student
        }));
        return;
      }

      // Successful login - store tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      const user = response.data.user;

      // Determine user flow based on access levels
      if (user.has_admin_access || user.is_admin) {
        console.log('👑 Admin user detected');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user,
          isStudentFlow: false,
          userType: 'admin'
        }));
      } else if (user.has_scanner_access || user.is_staff) {
        console.log('👥 Staff user detected');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user,
          isStudentFlow: false,
          userType: 'staff'
        }));
      } else if (user.has_student_features) {
        console.log('👨‍🎓 Student user detected');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user,
          isStudentFlow: true,
          userType: 'student',
          registrationStatus: 'approved'
        }));
      } else {
        // No access
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: 'No access permissions found'
        }));
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      
      // Handle 403 specifically
      if (error.response?.status === 403) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: error.response.data.error,
          showAccessDenied: true,
          canRegisterAsStudent: error.response.data.can_register_as_student,
          telegramUser
        }));
      } else {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          error: `Authentication failed: ${error.response?.data?.error || error.message}`
        }));
      }
    }
  };

  const handleRetry = () => {
    setAppState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    initializeApp();
  };

  // Debug logging
  console.log('🔍 App state:', appState);

  // Render loading screen
  if (appState.isLoading) {
    return <LoadingScreen />;
  }

  // Render error screen
  if (appState.error) {
    if (!appState.isInTelegram) {
      return <TelegramOnly />;
    }
    return <ErrorScreen error={appState.error} onRetry={handleRetry} />;
  }

  // Handle access denied screen
  if (appState.showAccessDenied) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-telegram-text mb-4">Access Denied</h1>
          <p className="text-telegram-hint mb-6">{appState.error}</p>
          {appState.canRegisterAsStudent && (
            <button
              onClick={() => {
                setAppState(prev => ({
                  ...prev,
                  showAccessDenied: false,
                  isStudentFlow: true,
                  registrationStatus: 'needs_registration'
                }));
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Register as Student
            </button>
          )}
        </div>
      </div>
    );
  }

  // Handle student flow
  if (appState.isStudentFlow && appState.telegramUser) {
    return (
      <StudentApp 
        telegramUser={appState.telegramUser} 
        user={appState.user}
        registrationStatus={appState.registrationStatus}
        studentData={appState.studentData}
      />
    );
  }

  // Render main app if admin/staff user exists
  if (!appState.user) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-telegram-text mb-4">Access Required</h1>
          <p className="text-telegram-hint">Please contact admin for access</p>
        </div>
      </div>
    );
  }

  // Render admin/staff app
  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text">
      {renderMainApp()}
    </div>
  );

  function renderMainApp() {
    const user = appState.user;

    // Admin interface
    if (appState.userType === 'admin' || user.has_admin_access) {
      return <AdminPanel user={user} telegramUser={appState.telegramUser} />;
    }

    // Staff interface
    if (appState.userType === 'staff' || user.has_scanner_access) {
      return <StaffPanel user={user} telegramUser={appState.telegramUser} />;
    }

    // Default: No access
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-telegram-text mb-4">No Access</h1>
          <p className="text-telegram-hint">Contact admin for access permissions</p>
        </div>
      </div>
    );
  }
}

export default App;