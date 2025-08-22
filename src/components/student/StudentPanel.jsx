import React, { useState } from 'react';
import BottomNavigation from '../common/BottomNavigation';
import { useToast } from '../common/Toast';
import StudentDashboard from './StudentDashboard';
import StudentMessCut from './StudentMessCut';
import StudentBills from './StudentBills';
import StudentProfile from './StudentProfile';

const StudentPanel = ({ user, telegramUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { showToast, ToastContainer } = useToast();

  // Handle hash-based navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'mess-cuts') {
        setActiveTab('mess-cut');
      } else if (hash === 'bills') {
        setActiveTab('bills');
      } else if (hash === 'profile') {
        setActiveTab('profile');
      } else if (hash === 'dashboard') {
        setActiveTab('dashboard');
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard user={user} showToast={showToast} />;
      case 'mess-cut':
        return <StudentMessCut user={user} showToast={showToast} />;
      case 'bills':
        return <StudentBills user={user} showToast={showToast} />;
      case 'profile':
        return <StudentProfile user={user} telegramUser={telegramUser} showToast={showToast} />;
      default:
        return <StudentDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {renderContent()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userType="student" 
      />
      <ToastContainer />
    </div>
  );
};

export default StudentPanel;
