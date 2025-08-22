import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UserCircleIcon,
  QrCodeIcon,
  CurrencyRupeeIcon,
  ScissorsIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = ({ user, showToast }) => {
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: null,
    qrCode: null,
    todaysMenu: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Load data with error handling for individual requests
      const [profileResponse, statsResponse] = await Promise.all([
        apiService.students.getProfile().catch(err => {
          console.error('Profile error:', err);
          return null;
        }),
        apiService.students.getDashboardStats().catch(err => {
          console.error('Stats error:', err);
          return null;
        })
      ]);

      console.log('Dashboard API responses:', { profileResponse, statsResponse });
      console.log('Extracted profile:', profileResponse?.data?.student || profileResponse?.student || profileResponse);
      console.log('Extracted stats:', statsResponse?.data?.stats || statsResponse?.stats || statsResponse);

      // Try to get QR code and menu separately with fallbacks
      let qrCodeResponse = null;
      let menuResponse = null;
      
      try {
        qrCodeResponse = await apiService.students.getQRCode();
      } catch (err) {
        console.error('QR code error:', err);
      }
      
      try {
        menuResponse = await apiService.students.getTodaysMenu();
      } catch (err) {
        console.error('Menu error:', err);
      }

      // Debug logging
      console.log('Profile response:', profileResponse);
      console.log('Stats response:', statsResponse);
      console.log('QR code response:', qrCodeResponse);
      console.log('Menu response:', menuResponse);

      setDashboardData({
        profile: profileResponse?.data?.student || profileResponse?.student || profileResponse,
        stats: statsResponse?.data?.stats || statsResponse?.stats || statsResponse,
        qrCode: qrCodeResponse?.qr_code || statsResponse?.data?.student?.qr_code || profileResponse?.data?.student?.qr_code || profileResponse?.qr_code_url,
        todaysMenu: menuResponse?.menu || {
          breakfast: 'Idli, Sambar, Chutney',
          lunch: 'Rice, Dal, Vegetable Curry',
          dinner: 'Chapati, Sabzi, Dal'
        },
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
      showToast?.('Failed to load dashboard data', 'error');
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const { profile, stats, qrCode, todaysMenu } = dashboardData;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header with Profile Photo and QR Code */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border-2 border-blue-200">
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
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
              <h2 className="text-lg font-semibold text-gray-900">{profile?.name || 'Student'}</h2>
              <p className="text-gray-600">Mess No: {profile?.mess_no || 'N/A'}</p>
              <p className="text-sm text-gray-500">{profile?.department || ''} - Year {profile?.year_of_study || ''}</p>
            </div>
          </div>

          {/* QR Code Display - Always show for mess entry */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-200">
            <div className="flex items-center justify-center mb-3">
              <QrCodeIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">Your Mess QR Code</h3>
            </div>
            {qrCode ? (
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-40 h-40 mx-auto mb-3 border-2 border-white rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-40 h-40 mx-auto mb-3 bg-white border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="w-16 h-16 text-blue-300" />
              </div>
            )}
            <p className="text-sm text-blue-700 font-medium">Show this QR code for mess entry</p>
            <p className="text-xs text-blue-600 mt-1">Keep this handy for scanning at meals</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Mess Cuts Taken"
            value={stats?.mess_cuts_taken || 0}
            subtitle={`Out of 10 allowed`}
            icon={ScissorsIcon}
            color="orange"
          />
          <StatCard
            title="Pending Bills"
            value={`₹${stats?.pending_bill_amount || 0}`}
            subtitle={stats?.pending_bill_amount > 0 ? 'Pay now' : 'All clear'}
            icon={CurrencyRupeeIcon}
            color={stats?.pending_bill_amount > 0 ? "red" : "green"}
          />
          <StatCard
            title="Today's Menu"
            value="Available"
            subtitle={typeof todaysMenu === 'object' ? 
              `${todaysMenu?.breakfast || 'Breakfast'}, ${todaysMenu?.lunch || 'Lunch'}, ${todaysMenu?.dinner || 'Dinner'}` : 
              (todaysMenu || "Rice, Dal, Sabji, Roti")
            }
            icon={DocumentTextIcon}
            color="green"
          />
          <StatCard
            title="Today's Date"
            value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            icon={CalendarDaysIcon}
            color="blue"
          />
        </div>

        {/* Status Alerts */}
        {stats?.pending_bill_amount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyRupeeIcon className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Payment Due</h4>
                <p className="text-red-700 text-sm">You have pending dues of ₹{stats.pending_bill_amount}. Please pay to avoid fines.</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => window.location.hash = '#mess-cuts'}
              className="bg-blue-50 text-blue-700 p-4 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <ScissorsIcon className="w-5 h-5" />
              Apply for Mess Cut
            </button>
            <button 
              onClick={() => window.location.hash = '#bills'}
              className="bg-green-50 text-green-700 p-4 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              <CurrencyRupeeIcon className="w-5 h-5" />
              View & Pay Bills
            </button>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ClockIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-medium">Reminder</h4>
              <p className="text-yellow-700 text-sm">
                Apply for mess cuts before 9:00 PM. Maximum 10 mess cuts allowed per month.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
