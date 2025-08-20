import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import {
  UserIcon,
  CurrencyRupeeIcon,
  QrCodeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import RegistrationFlow from '../common/RegistrationFlow';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    console.log('🔄 Dashboard mounting...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📤 Loading dashboard data...');

      // Check auth token
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Auth token:', token ? 'Present' : 'Missing');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // Load profile data
      try {
        console.log('📤 Fetching profile...');
        const profileResponse = await apiService.auth.getProfile();
        console.log('📥 Profile data:', profileResponse.data);
        setUserProfile(profileResponse.data);
      } catch (profileError) {
        console.error('❌ Profile error:', profileError);
        setError(`Profile error: ${profileError.response?.data?.error || profileError.message}`);
      }

      // Load current bill (optional)
      try {
        console.log('📤 Fetching current bill...');
        const billResponse = await apiService.bills.getCurrentBill();
        console.log('📥 Bill data:', billResponse.data);
        setCurrentBill(billResponse.data);
      } catch (billError) {
        console.log('⚠️ No current bill:', billError.response?.data);
        // Bill is optional, don't set error
      }

    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setError(`Failed to load dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  const student = userProfile?.student;
  const user = userProfile?.user;

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      <div className="p-4 space-y-6">

        {/* Welcome Header */}
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Welcome, {student?.name || user?.first_name || 'Student'}!
          </h1>
          {student?.mess_no && (
            <p className="text-telegram-hint">Mess No: {student.mess_no}</p>
          )}
          {student?.is_approved ? (
            <span className="inline-block px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm mt-2">
              ✅ Approved
            </span>
          ) : student ? (
            <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm mt-2">
              ⏳ Pending Approval
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm mt-2">
              👋 Welcome
            </span>
          )}
        </div>

        {/* Registration Flow for Approved Users */}
        {student?.is_approved && (
          <RegistrationFlow currentStep="approved" />
        )}

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
            </div>
            {currentBill.status === 'pending' && (
              <button
                onClick={() => navigate('/bills')}
                className="w-full mt-4 bg-telegram-accent text-white py-2 rounded-lg hover:bg-telegram-accent/80"
              >
                Pay Now
              </button>
            )}
          </div>
        )}

        {/* No Bill Message */}
        {!currentBill && (
          <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 text-center">
            <CurrencyRupeeIcon className="w-12 h-12 text-telegram-hint mx-auto mb-3" />
            <h3 className="text-telegram-text font-medium mb-2">No Current Bill</h3>
            <p className="text-telegram-hint text-sm">Your bill will appear here once generated</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/bills')}
              className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors"
            >
              <CurrencyRupeeIcon className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">My Bills</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors"
            >
              <UserIcon className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={() => navigate('/mess-cuts')}
              className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors"
            >
              <CalendarDaysIcon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Mess Cuts</span>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="flex flex-col items-center p-4 bg-telegram-bg rounded-lg border border-gray-600 hover:border-telegram-accent transition-colors"
            >
              <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-telegram-text text-sm font-medium">Attendance</span>
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-telegram-text font-medium">Dashboard Active</p>
              <p className="text-telegram-hint text-sm">All features are working properly</p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-telegram-text font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Auth Token: {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}</div>
            <div>User Profile: {userProfile ? '✅ Loaded' : '❌ Missing'}</div>
            <div>Student Data: {student ? '✅ Present' : '❌ Missing'}</div>
            <div>Current Bill: {currentBill ? '✅ Present' : '⚠️ None'}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;