import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  HomeIcon,
  CurrencyRupeeIcon,
  QrCodeIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CurrencyRupeeIcon as CurrencyRupeeIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  UserIcon as UserIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Check if user has scanner or admin access
  const hasScanner = user?.has_scanner_access || user?.has_admin_access || false;
  const isAdmin = user?.has_admin_access || false;

  const baseTabs = [
    {
      id: 'dashboard',
      path: '/',
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: 'bills',
      path: '/bills',
      label: 'Bills',
      icon: CurrencyRupeeIcon,
      activeIcon: CurrencyRupeeIconSolid,
    },
  ];

  const scannerTab = {
    id: 'scanner',
    path: '/scanner',
    label: 'Scanner',
    icon: QrCodeIcon,
    activeIcon: QrCodeIconSolid,
  };

  const adminTab = {
    id: 'admin',
    path: '/admin',
    label: 'Admin',
    icon: CogIcon,
    activeIcon: CogIconSolid,
  };

  const profileTab = {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  };

  // Build tabs array based on user permissions
  let tabs = [...baseTabs];

  if (hasScanner) {
    tabs.push(scannerTab);
  }

  if (isAdmin) {
    tabs.push(adminTab);
  }

  tabs.push(profileTab);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-telegram-secondary border-t border-gray-600">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                isActive 
                  ? 'text-telegram-accent' 
                  : 'text-telegram-hint hover:text-telegram-text'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
