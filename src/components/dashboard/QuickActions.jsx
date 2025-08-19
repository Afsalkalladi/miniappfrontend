import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCodeIcon, 
  CurrencyRupeeIcon, 
  CalendarDaysIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'bills',
      title: 'My Bills',
      description: 'View & pay my bills',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      onClick: () => navigate('/bills'),
    },
    {
      id: 'mess-cut',
      title: 'Apply Mess Cut',
      description: 'Apply for leave',
      icon: CalendarDaysIcon,
      color: 'bg-orange-500',
      onClick: () => navigate('/mess-cuts'),
    },
    {
      id: 'attendance',
      title: 'My Attendance',
      description: 'View my history',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      onClick: () => navigate('/attendance'),
    },
    {
      id: 'qr-code',
      title: 'My QR Code',
      description: 'View/regenerate QR',
      icon: QrCodeIcon,
      color: 'bg-blue-500',
      onClick: () => navigate('/qr-code'),
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center p-4 bg-telegram-secondary rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors"
          >
            <div className={`p-3 rounded-full ${action.color} mb-2`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-telegram-text font-medium text-sm">{action.title}</span>
            <span className="text-telegram-hint text-xs mt-1">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
