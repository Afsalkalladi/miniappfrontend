import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import BillCard from './BillCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);

      // Load user profile
      const profileResponse = await apiService.auth.getProfile().catch(() => ({ data: null }));
      if (profileResponse.data) {
        setUserProfile(profileResponse.data);
      }

      // Load current bill
      const billResponse = await apiService.bills.getCurrentBill().catch(() => ({ data: null }));
      setCurrentBill(billResponse.data);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
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
          Welcome, {userProfile?.student?.name || userProfile?.user?.first_name || 'Student'}!
        </h1>
        <p className="text-telegram-hint mt-1">
          {userProfile?.student?.mess_no ? `Mess No: ${userProfile.student.mess_no}` : 'Your dashboard for mess services'}
        </p>
        {userProfile?.student?.is_approved ? (
          <span className="inline-block px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm mt-2">
            ✓ Approved
          </span>
        ) : userProfile?.student ? (
          <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm mt-2">
            ⏳ Pending Approval
          </span>
        ) : (
          <span className="inline-block px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm mt-2">
            ✓ Active
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Current Bill */}
      {currentBill && <BillCard bill={currentBill} />}

      {/* No Bill Message */}
      {!loading && !currentBill && !error && (
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 text-center">
          <p className="text-telegram-hint">No current bill available</p>
          <p className="text-telegram-hint text-sm mt-1">Your bill will appear here once generated</p>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
