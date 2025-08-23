import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ScissorsIcon, 
  CurrencyRupeeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import PendingStudentsList from './PendingStudentsList';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    active_users: 0,
    mess_cuts_tomorrow: 0,
    unpaid_bills_count: 0,
    pending_users: 0
  });
  const [isStudentManagementExpanded, setIsStudentManagementExpanded] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, todayStats] = await Promise.all([
        apiService.admin.getDashboardStats(),
        apiService.admin.getTodayAttendanceStats()
      ]);
      
      setStats(dashboardStats);
      setAttendanceStats(todayStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage mess operations and monitor statistics</p>
        </div>

        {/* Stats Grid - Only 2 Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={ScissorsIcon}
            title="Tomorrow's Mess Cuts"
            value={stats.mess_cuts_tomorrow}
            subtitle="Students on leave"
            color="orange"
          />
          <StatCard
            icon={CurrencyRupeeIcon}
            title="Unpaid Bills"
            value={stats.unpaid_bills_count}
            subtitle="Students with dues"
            color="red"
          />
        </div>

        {/* Student Management Section - Expandable */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <button
            onClick={() => setIsStudentManagementExpanded(!isStudentManagementExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Student Management
            </h2>
            {isStudentManagementExpanded ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {/* Always show active students count */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Active Students</h3>
                <p className="text-sm text-blue-600">Approved and registered</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-900">{stats.active_users}</span>
          </div>

          {/* Expandable Section - Only Pending Students */}
          {isStudentManagementExpanded && (
            <div className="border-t pt-4">
              <PendingStudentsList />
            </div>
          )}
        </div>

        {/* Today's Attendance Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CalendarDaysIcon className="h-6 w-6 mr-2" />
            Today's Attendance Statistics
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-orange-800">Breakfast</h3>
                  <p className="text-xs text-orange-600">Students scanned</p>
                </div>
              </div>
              <p className="text-xl font-bold text-orange-900">{attendanceStats.breakfast}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-800">Lunch</h3>
                  <p className="text-xs text-blue-600">Students scanned</p>
                </div>
              </div>
              <p className="text-xl font-bold text-blue-900">{attendanceStats.lunch}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-purple-800">Dinner</h3>
                  <p className="text-xs text-purple-600">Students scanned</p>
                </div>
              </div>
              <p className="text-xl font-bold text-purple-900">{attendanceStats.dinner}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
