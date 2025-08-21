import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UserCircleIcon,
  QrCodeIcon,
  CurrencyRupeeIcon,
  ScissorsIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = ({ user, showToast }) => {
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      const [profileResponse, statsResponse] = await Promise.all([
        apiService.students.getProfile(),
        apiService.students.getDashboardStats()
      ]);

      setDashboardData({
        profile: profileResponse.data.student,
        stats: statsResponse.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
      showToast('Failed to load dashboard data', 'error');
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const { profile, stats } = dashboardData;

  return (
    <div className="p-4 space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
            {profile?.profile_photo ? (
              <img 
                src={profile.profile_photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-600">Mess No: {profile?.mess_no}</p>
          </div>
        </div>

        {/* QR Code Display */}
        {profile?.qr_code && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <img 
              src={profile.qr_code} 
              alt="QR Code" 
              className="w-32 h-32 mx-auto mb-2"
            />
            <p className="text-sm text-gray-600">Show this QR code for mess entry</p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Mess Cuts Taken"
          value={stats?.mess_cuts_taken || 0}
          icon={ScissorsIcon}
          color="orange"
        />
        <StatsCard
          title="Pending Bill"
          value={`₹${stats?.pending_bill_amount || 0}`}
          icon={CurrencyRupeeIcon}
          color="red"
        />
        <StatsCard
          title="Monthly Attendance"
          value={stats?.attendance_this_month || 0}
          icon={ClockIcon}
          color="blue"
        />
        <StatsCard
          title="Today's Menu"
          value="Available"
          subtitle={stats?.todays_menu || "Rice, Dal, Sabji"}
          icon={DocumentTextIcon}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-blue-50 text-blue-700 p-3 rounded-lg font-medium hover:bg-blue-100 transition-colors">
            Apply Mess Cut
          </button>
          <button className="bg-green-50 text-green-700 p-3 rounded-lg font-medium hover:bg-green-100 transition-colors">
            Pay Bills
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
