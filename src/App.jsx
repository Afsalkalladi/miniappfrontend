import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorScreen from './components/common/ErrorScreen';
import TelegramOnly from './components/common/TelegramOnly';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PendingApproval from './components/auth/PendingApproval';
import Dashboard from './components/dashboard/Dashboard';
import Bills from './components/bills/Bills';
import Profile from './components/profile/Profile';
import MessCuts from './components/messCuts/MessCuts';
import Attendance from './components/attendance/Attendance';
import AdminPanel from './components/admin/AdminPanel';
import StaffPanel from './components/staff/StaffPanel';
import Navigation from './components/common/Navigation';
import ApiTest from './components/debug/ApiTest';

// Services
import { apiService } from './services/apiService';

function App() {
  const [appState, setAppState] = useState({
    isLoading: true,
    error: null,
    isInTelegram: false,
    telegramUser: null,
    user: null,
    needsRegistration: false,
    registrationData: null,
    showPendingApproval: false
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

      if (response.data.needs_registration) {
        setAppState(prev => ({
          ...prev,
          isLoading: false,
          isInTelegram: true,
          telegramUser,
          needsRegistration: true
        }));
      } else {
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
          needsRegistration: false
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

  const handleRegistrationSuccess = (data) => {
    console.log('✅ Registration successful:', data);
    setAppState(prev => ({
      ...prev,
      registrationData: data,
      showPendingApproval: true,
      needsRegistration: false
    }));
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

  // Render pending approval screen
  if (appState.showPendingApproval && appState.registrationData) {
    return <PendingApproval registrationData={appState.registrationData} />;
  }

  // Render registration form
  if (appState.needsRegistration && appState.telegramUser) {
    return (
      <Register
        telegramUser={appState.telegramUser}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  // Render login screen if no user
  if (!appState.user) {
    return <Login onRetry={handleRetry} />;
  }

  // Render main app based on user type
  return (
    <Router>
      <div className="min-h-screen bg-telegram-bg text-telegram-text">
        {renderMainApp()}
        <Navigation />
      </div>
    </Router>
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

    // Student interface
    return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mess-cuts" element={<MessCuts />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/api-test" element={<ApiTest />} />
      </Routes>
    );
  }
}

export default App;