import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Dashboard from './components/dashboard/Dashboard';
import Bills from './components/bills/Bills';
import Scanner from './components/scanner/Scanner';
import Profile from './components/profile/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PendingApproval from './components/auth/PendingApproval';
import Navigation from './components/common/Navigation';
import TelegramOnly from './components/common/TelegramOnly';
import MessCuts from './components/messCuts/MessCuts';
import Attendance from './components/attendance/Attendance';
import AdminPanel from './components/admin/AdminPanel';
import StaffPanel from './components/staff/StaffPanel';
import QRCodeManager from './components/student/QRCodeManager';
import Notifications from './components/student/Notifications';

function App() {
  const { user, initializeUser, isLoading, needsRegistration, telegramUser } = useAuthStore();
  const [registrationData, setRegistrationData] = React.useState(null);
  const [showPendingApproval, setShowPendingApproval] = React.useState(false);

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set theme
      tg.setHeaderColor('#17212b');
      tg.setBackgroundColor('#17212b');

      // Initialize user from Telegram data
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser && telegramUser.id) {
        initializeUser(telegramUser);
      } else {
        // No Telegram user data available - show login screen
        console.error('No Telegram user data available');
      }
    } else {
      // Not running in Telegram - show access denied
      console.error('Not running in Telegram WebApp');
    }
  }, [initializeUser]);

  // Check if running in Telegram with valid user data
  const isInTelegram = window.Telegram?.WebApp;
  const hasTelegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

  if (!isInTelegram || !hasTelegramUser) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
          <div className="text-telegram-text">Loading...</div>
        </div>
      );
    }
    return <TelegramOnly />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-telegram-text">Loading...</div>
      </div>
    );
  }

  // Handle registration flow
  const handleRegistrationSuccess = (data) => {
    setRegistrationData(data);
    setShowPendingApproval(true);
  };

  // Show pending approval screen
  if (showPendingApproval && registrationData) {
    return <PendingApproval registrationData={registrationData} />;
  }

  // Show registration form for new users
  if (needsRegistration && telegramUser) {
    return (
      <Register
        telegramUser={telegramUser}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  // Show login screen if no user
  if (!user) {
    return <Login />;
  }

  // Check if user is pending approval
  if (user && user.student && !user.student.is_approved) {
    return <PendingApproval registrationData={user.student} />;
  }

  // User type based routing
  const renderAppContent = () => {
    // Debug user object
    console.log('User object:', user);
    console.log('is_admin:', user.is_admin);
    console.log('is_staff:', user.is_staff);

    // Check user type and render appropriate interface
    if (user.is_admin) {
      console.log('Rendering AdminPanel');
      return <AdminPanel />;
    } else if (user.is_staff) {
      console.log('Rendering StaffPanel');
      return <StaffPanel />;
    } else {
      // Student interface
      return (
        <Router>
          <div className="min-h-screen bg-telegram-bg text-telegram-text">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mess-cuts" element={<MessCuts />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/qr-code" element={<QRCodeManager />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
            <Navigation />
          </div>
        </Router>
      );
    }
  };

  return renderAppContent();
}

export default App;
