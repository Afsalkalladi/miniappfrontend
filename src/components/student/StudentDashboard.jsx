import React, { useEffect, useState } from 'react';
import {
  UserIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentDashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    currentBill: null,
    recentActivity: []
  });

  console.log('🏠 StudentDashboard component loaded');
  console.log('👤 User data:', user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📤 Loading dashboard data...');

      // Load user profile
      let profileData = null;
      try {
        const profileResponse = await apiService.auth.getProfile();
        console.log('📥 Profile data:', profileResponse.data);
        profileData = {
          name: profileResponse.data.student?.name || profileResponse.data.user?.first_name || 'Student',
          mess_no: profileResponse.data.student?.mess_no || 'N/A',
          department: profileResponse.data.student?.department || 'N/A',
          is_approved: profileResponse.data.student?.is_approved || false
        };
      } catch (error) {
        console.error('⚠️ Failed to load profile:', error);
        profileData = {
          name: user?.student?.name || user?.user?.first_name || 'Student',
          mess_no: user?.student?.mess_no || 'N/A',
          department: user?.student?.department || 'N/A',
          is_approved: user?.student?.is_approved || false
        };
      }

      // Load current bill
      let currentBillData = null;
      try {
        const billResponse = await apiService.bills.getCurrentBill();
        console.log('📥 Current bill:', billResponse.data);
        currentBillData = billResponse.data;
      } catch (error) {
        console.log('⚠️ No current bill found:', error.response?.data);
        // No current bill is okay
      }

      // Mock recent activity for now
      const recentActivity = [
        { type: 'login', message: 'Logged into dashboard', time: 'Just now' },
        { type: 'system', message: 'Profile data loaded', time: '1 minute ago' }
      ];

      const dashboardData = {
        profile: profileData,
        currentBill: currentBillData,
        recentActivity
      };

      console.log('📥 Dashboard data loaded:', dashboardData);
      setDashboardData(dashboardData);

    } catch (error) {
      console.error('❌ Failed to load dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent mx-auto mb-4"></div>
          <p className="text-telegram-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Dashboard Error</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-telegram-accent text-white px-4 py-2 rounded-lg hover:bg-telegram-accent/80"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, currentBill, recentActivity } = dashboardData;

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Welcome, {profile?.name}!
          </h1>
          <p className="text-telegram-hint">
            Mess No: {profile?.mess_no}
          </p>
          {profile?.is_approved ? (
            <span className="inline-block px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm mt-2">
              ✅ Approved
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm mt-2">
              ⏳ Pending Approval
            </span>
          )}
        </div>

        {/* Current Bill Card */}
        {currentBill && (
          <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-telegram-text">Current Bill</h3>
              <div className="flex items-center gap-2 text-telegram-accent">
                <CurrencyRupeeIcon className="w-5 h-5" />
                <span className="text-xl font-bold">₹{currentBill.amount}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-telegram-hint">Month</span>
                <span className="text-telegram-text">
                  {new Date(currentBill.month).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-telegram-hint">Status</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  currentBill.status === 'paid' 
                    ? 'bg-green-400/20 text-green-400' 
                    : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {currentBill.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-telegram-hint">Due Date</span>
                <span className="text-telegram-text">
                  {new Date(currentBill.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            {currentBill.status === 'pending' && (
              <button className="w-full mt-4 bg-telegram-accent text-white py-2 rounded-lg hover:bg-telegram-accent/80">
                Pay Now
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors">
              <CurrencyRupeeIcon className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">My Bills</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors">
              <UserIcon className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Profile</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors">
              <CalendarDaysIcon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Mess Cuts</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors">
              <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Attendance</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-telegram-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="text-telegram-text text-sm">{activity.message}</p>
                  <p className="text-telegram-hint text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-telegram-text font-medium">Dashboard Active</p>
              <p className="text-telegram-hint text-sm">All features working properly</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600"
        >
          Logout
        </button>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-telegram-text font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Component: StudentDashboard</div>
            <div>User: {user ? 'Present' : 'Missing'}</div>
            <div>Profile: {profile ? 'Loaded' : 'Missing'}</div>
            <div>Current Bill: {currentBill ? 'Present' : 'None'}</div>
            <div>Activities: {recentActivity.length}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
