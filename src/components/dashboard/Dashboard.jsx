import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/apiService';
import BillCard from './BillCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const billResponse = await apiService.bills.getCurrentBill().catch(() => ({ data: null }));
      setCurrentBill(billResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set current bill to null if there's an error
      setCurrentBill(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse bg-telegram-secondary h-32 rounded-lg"></div>
        <div className="animate-pulse bg-telegram-secondary h-24 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-telegram-text">
          Welcome, {user?.student?.name || user?.first_name}!
        </h1>
        <p className="text-telegram-hint mt-1">
          Mess No: {user?.student?.mess_no || 'Not assigned'}
        </p>
      </div>

      {/* Current Bill */}
      {currentBill && <BillCard bill={currentBill} />}

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
