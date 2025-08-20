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
    console.log('is_admin:', user?.is_admin);
    console.log('is_staff:', user?.is_staff);
    console.log('has_admin_access:', user?.has_admin_access);
    console.log('has_scanner_access:', user?.has_scanner_access);

    // Check user type and render appropriate interface
    if (user?.is_admin || user?.has_admin_access) {
      console.log('Rendering AdminPanel for admin user');
      return (
        <div className="min-h-screen bg-telegram-bg text-telegram-text p-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-telegram-text mb-2">Admin Panel</h1>
            <p className="text-telegram-hint">Mess Management System</p>
          </div>

          <div className="space-y-4">
            <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold text-telegram-text mb-2">Welcome, Admin!</h3>
              <p className="text-telegram-hint">Admin panel is loading...</p>
            </div>

            <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold text-telegram-text mb-2">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-telegram-accent">150</div>
                  <div className="text-telegram-hint text-sm">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">12</div>
                  <div className="text-telegram-hint text-sm">Pending Approvals</div>
                </div>
              </div>
            </div>

            <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold text-telegram-text mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
                  Approve Students
                </button>
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg">
                  Generate Bills
                </button>
                <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (user?.is_staff || user?.has_scanner_access) {
      console.log('Rendering StaffPanel for staff user');
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
