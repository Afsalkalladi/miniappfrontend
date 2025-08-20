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
    isStudentFlow: false
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

      // Handle both admin/staff and student users
      if (response.data.needs_registration || response.data.user?.role === 'student') {
        // Student flow - let StudentApp handle the complete flow
        console.log('👨‍🎓 Student user detected, delegating to StudentApp');
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user: null, // Let StudentApp handle user state
          isStudentFlow: true
        }));
      } else {
        // Admin/Staff flow
        console.log('👨‍💼 Admin/Staff user detected');

        // Store auth token
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }

        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          user: response.data.user,
          isStudentFlow: false
        }));
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: `Authentication failed: ${error.response?.data?.error || error.message}`
      }));
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

  // Handle student flow
  if (appState.isStudentFlow && appState.telegramUser) {
    return <StudentApp telegramUser={appState.telegramUser} />;
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
    if (user.is_admin || user.has_admin_access) {
      return <AdminPanel />;
    }

    // Staff interface
    if (user.is_staff || user.has_scanner_access) {
      return <StaffPanel />;
    }

    // Default: No access
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-telegram-text mb-4">No Access</h1>
          <p className="text-telegram-hint">Student features coming soon</p>
        </div>
      </div>
    );
  }
}

export default App;