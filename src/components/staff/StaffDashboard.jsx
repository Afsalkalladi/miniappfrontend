import React, { useState, useEffect } from 'react';
import { 
  QrCodeIcon, 
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import StaffQRScanner from './StaffQRScanner';

const StaffDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffStats();
  }, []);

  const loadStaffStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.staff.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load staff stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMeal = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    return 'dinner';
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTime = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '7:00 AM - 10:00 AM';
      case 'lunch': return '12:00 PM - 3:00 PM';
      case 'dinner': return '7:00 PM - 10:00 PM';
      default: return '';
    }
  };

  // Render different views based on currentView
  if (currentView === 'scanner') {
    return <StaffQRScanner onBack={() => setCurrentView('dashboard')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-secondary h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">Staff Dashboard</h1>
        <p className="text-telegram-hint">Manage mess attendance and student verification</p>
      </div>

      {/* Current Meal Info */}
      <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{getMealIcon(getCurrentMeal())}</div>
          <h3 className="text-telegram-text font-semibold text-lg capitalize mb-1">
            {getCurrentMeal()} Time
          </h3>
          <p className="text-telegram-hint text-sm">
            {getMealTime(getCurrentMeal())}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => setCurrentView('scanner')}
          className="bg-telegram-accent text-white p-6 rounded-lg hover:bg-telegram-accent/80 transition-colors"
        >
          <div className="flex items-center justify-center gap-3">
            <QrCodeIcon className="w-8 h-8" />
            <div className="text-left">
              <h3 className="font-semibold text-lg">QR Scanner</h3>
              <p className="text-sm opacity-90">Scan student QR codes for attendance</p>
            </div>
          </div>
        </button>
      </div>

      {/* Today's Statistics */}
      {stats && (
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Today's Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-telegram-accent">{stats.today_scans || 0}</div>
              <div className="text-telegram-hint text-sm">Total Scans</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.unique_students || 0}</div>
              <div className="text-telegram-hint text-sm">Unique Students</div>
            </div>
          </div>

          {/* Meal Breakdown */}
          <div className="space-y-2">
            <h4 className="text-telegram-text font-medium text-sm">Meal Breakdown:</h4>
            {['breakfast', 'lunch', 'dinner'].map((meal) => (
              <div key={meal} className="flex items-center justify-between p-2 bg-telegram-bg rounded">
                <div className="flex items-center gap-2">
                  <span>{getMealIcon(meal)}</span>
                  <span className="text-telegram-text text-sm capitalize">{meal}</span>
                </div>
                <span className="text-telegram-text font-medium">
                  {stats.meal_breakdown?.[meal] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recent_scans && stats.recent_scans.length > 0 && (
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Recent Scans</h3>
          
          <div className="space-y-3">
            {stats.recent_scans.slice(0, 5).map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-telegram-bg rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-telegram-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {scan.student_name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div>
                    <div className="text-telegram-text font-medium text-sm">
                      {scan.student_name}
                    </div>
                    <div className="text-telegram-hint text-xs">
                      {scan.mess_no} • {scan.meal_type}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-telegram-text text-sm">
                    {new Date(scan.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs">Marked</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">📱 How to Use</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Tap "QR Scanner" to start scanning student QR codes</li>
          <li>• Student information will appear with mess cut status</li>
          <li>• Students on mess cut will be blocked from entry</li>
          <li>• Mark attendance for eligible students</li>
          <li>• View payment status and student details</li>
        </ul>
      </div>
    </div>
  );
};

export default StaffDashboard;
