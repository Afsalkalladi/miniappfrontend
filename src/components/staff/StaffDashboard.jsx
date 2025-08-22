import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import StaffQRScanner from './StaffQRScanner';
import MealTimeCard from './dashboard/MealTimeCard';
import QuickActions from './dashboard/QuickActions';
import StatsCard from './dashboard/StatsCard';
import RecentScansCard from './dashboard/RecentScansCard';
import InstructionsCard from './dashboard/InstructionsCard';

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

      <MealTimeCard currentMeal={getCurrentMeal()} />
      
      <QuickActions onScannerClick={() => setCurrentView('scanner')} />
      
      <StatsCard stats={stats} />
      
      <RecentScansCard recentScans={stats?.recent_scans} />
      
      <InstructionsCard />
    </div>
  );
};

export default StaffDashboard;
