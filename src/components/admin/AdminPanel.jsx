import React, { useState } from 'react';
import BottomNavigation from '../common/BottomNavigation';
import { useToast } from '../common/Toast';
import AdminDashboard from './AdminDashboard';
import AdminBills from './AdminBills';
import AdminReports from './AdminReports';
import AdminNotifications from './AdminNotifications';
import AdminProfile from './AdminProfile';
import StaffQRScanner from '../staff/StaffQRScanner';

const AdminPanel = ({ user, telegramUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard user={user} showToast={showToast} />;
      case 'bills':
        return <AdminBills user={user} showToast={showToast} />;
      case 'reports':
        return <AdminReports user={user} showToast={showToast} />;
      case 'notifications':
        return <AdminNotifications user={user} showToast={showToast} />;
      case 'scanner':
        return <StaffQRScanner onBack={() => setActiveTab('dashboard')} />;
      case 'profile':
        return <AdminProfile user={user} telegramUser={telegramUser} showToast={showToast} />;
      default:
        return <AdminDashboard user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {renderContent()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userType="admin" 
      />
      <ToastContainer />
    </div>
  );
};

export default AdminPanel;
