import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ScissorsIcon, 
  CurrencyRupeeIcon, 
  QrCodeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { apiService } from '../../services/apiService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    active_users: 0,
    mess_cuts_tomorrow: 0,
    unpaid_bills_count: 0,
    total_revenue: 0
  });
  const [attendanceStats, setAttendanceStats] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0
  });
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(apiService.utils.getCurrentMealType());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  const handleQRScan = async (result) => {
    try {
      setScannerActive(false);
      const messNo = result[0]?.rawValue;
      
      if (!messNo) {
        setScanResult({ success: false, message: 'Invalid QR code' });
        return;
      }

      const response = await apiService.admin.markAttendance(messNo, selectedMeal, selectedDate);
      setScanResult({ 
        success: true, 
        message: `Attendance marked for Mess No: ${messNo}`,
        studentInfo: response.student_info
      });
      
      // Refresh attendance stats
      const todayStats = await apiService.admin.getTodayAttendanceStats();
      setAttendanceStats(todayStats);
      
    } catch (error) {
      setScanResult({ 
        success: false, 
        message: error.message || 'Failed to mark attendance' 
      });
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={UsersIcon}
            title="Active Users"
            value={stats.active_users}
            subtitle="Registered students"
            color="blue"
          />
          <StatCard
            icon={ScissorsIcon}
            title="Tomorrow's Mess Cuts"
            value={stats.mess_cuts_tomorrow}
            subtitle="Students on leave"
            color="yellow"
          />
          <StatCard
            icon={CurrencyRupeeIcon}
            title="Unpaid Bills"
            value={stats.unpaid_bills_count}
            subtitle="Students with dues"
            color="red"
          />
          <StatCard
            icon={CurrencyRupeeIcon}
            title="Total Revenue"
            value={`₹${stats.total_revenue?.toLocaleString() || 0}`}
            subtitle="This month"
            color="green"
          />
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <QrCodeIcon className="h-6 w-6 mr-2" />
              QR Scanner
            </h2>
            <button
              onClick={() => setScannerActive(!scannerActive)}
              className={`px-4 py-2 rounded-lg font-medium ${
                scannerActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
            </button>
          </div>

          {/* Scanner Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal</label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          {/* QR Scanner */}
          {scannerActive && (
            <div className="mb-4">
              <QrScanner
                onDecode={handleQRScan}
                onError={(error) => console.error('QR Scanner Error:', error)}
                containerStyle={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
              />
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className={`p-4 rounded-lg ${
              scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {scanResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                )}
                <p className={`font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {scanResult.message}
                </p>
              </div>
              {scanResult.studentInfo && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Student: {scanResult.studentInfo.name}</p>
                  <p>Department: {scanResult.studentInfo.department}</p>
                  {scanResult.studentInfo.has_pending_dues && (
                    <p className="text-red-600 font-medium">⚠️ Has pending dues</p>
                  )}
                  {scanResult.studentInfo.is_on_mess_cut && (
                    <p className="text-yellow-600 font-medium">✂️ On mess cut today</p>
                  )}
                </div>
              )}
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
