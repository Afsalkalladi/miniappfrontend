import React, { useState } from 'react';
import BottomNavigation from '../common/BottomNavigation';
import { useToast } from '../common/Toast';
import StaffScanner from './StaffScanner';
import StaffProfile from './StaffProfile';

const StaffPanel = ({ user, telegramUser }) => {
  const [activeTab, setActiveTab] = useState('scanner');
  const { showToast } = useToast();

  const renderContent = () => {
    switch (activeTab) {
      case 'scanner':
        return <StaffScanner user={user} showToast={showToast} />;
      case 'profile':
        return <StaffProfile user={user} telegramUser={telegramUser} showToast={showToast} />;
      default:
        return <StaffScanner user={user} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {renderContent()}
      <BottomNavigation 
        role="staff" 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default StaffPanel;
