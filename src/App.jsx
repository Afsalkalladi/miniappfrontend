import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Dashboard from './components/dashboard/Dashboard';
import Bills from './components/bills/Bills';
import Scanner from './components/scanner/Scanner';
import Profile from './components/profile/Profile';
import Login from './components/auth/Login';
import Navigation from './components/common/Navigation';

function App() {
  const { user, initializeUser, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme
      tg.setHeaderColor('#17212b');
      tg.setBackgroundColor('#17212b');
      
      // Initialize user from Telegram data
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        initializeUser(telegramUser);
      } else {
        // For development - mock user data
        const mockUser = {
          id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User'
        };
        initializeUser(mockUser);
      }
    } else {
      // For development without Telegram
      const mockUser = {
        id: 123456789,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      };
      initializeUser(mockUser);
    }
  }, [initializeUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-telegram-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-telegram-bg text-telegram-text">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
