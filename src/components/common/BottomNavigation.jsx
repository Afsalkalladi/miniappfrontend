import React from 'react';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  BellIcon, 
  UserIcon,
  ScissorsIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  DocumentTextIcon as DocumentTextIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  BellIcon as BellIconSolid, 
  UserIcon as UserIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  QrCodeIcon as QrCodeIconSolid
} from '@heroicons/react/24/solid';

const BottomNavigation = ({ activeTab, onTabChange, userType }) => {
  const getNavItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
          { id: 'bills', label: 'Bills', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
          { id: 'reports', label: 'Reports', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
          { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: UserIconSolid },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
          { id: 'mess-cut', label: 'Mess Cuts', icon: ScissorsIcon, activeIcon: ScissorsIconSolid },
          { id: 'bills', label: 'Bills', icon: DocumentTextIcon, activeIcon: DocumentTextIconSolid },
          { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: UserIconSolid },
        ];
      case 'staff':
        return [
          { id: 'scanner', label: 'Scanner', icon: QrCodeIcon, activeIcon: QrCodeIconSolid },
          { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: UserIconSolid },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
