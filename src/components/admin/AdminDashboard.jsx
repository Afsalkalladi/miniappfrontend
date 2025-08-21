import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import StatsCard from '../common/StatsCard';
import QRScannerComponent from '../common/QRScanner';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UsersIcon,
  ScissorsIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  QrCodeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = ({ user, showToast }) => {
  const [stats, setStats] = useState(null);
  const [scannerStats, setScannerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);

  useEffect(() => {
    loadDashboardData();
    updateCurrentMeal();
    
    // Update meal every minute
    const interval = setInterval(updateCurrentMeal, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateCurrentMeal = () => {
    const meal = apiService.utils.getCurrentMeal();
    setCurrentMeal(meal);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResult, scannerResult] = await Promise.allSettled([
        apiService.admin.getDashboardStats(),
        apiService.scanner.getStats({ date: apiService.utils.getCurrentDate() })
      ]);

      if (dashboardResult.status === 'fulfilled') {
        setStats(dashboardResult.value.data);
      } else {
        console.error('Dashboard stats failed:', dashboardResult.reason);
        setStats({});
        showToast('Dashboard stats unavailable', 'warning');
      }

      if (scannerResult.status === 'fulfilled') {
        setScannerStats(scannerResult.value.data);
      } else {
        console.error('Scanner stats failed:', scannerResult.reason);
        setScannerStats(null);
        showToast('Scanner stats unavailable', 'warning');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData) => {
    if (isScanning) return;
    
    setIsScanning(true);
    try {
      const response = await apiService.scanner.scanStudent({
        qr_data: qrData,
        meal_type: currentMeal,
        date: apiService.utils.getCurrentDate()
      });

      if (response.data.success) {
        const student = response.data.student;
        let message = `✅ ${student.name} (${student.mess_no}) - Attendance marked`;
        
        if (response.data.warnings && response.data.warnings.length > 0) {
          message += `\n⚠️ ${response.data.warnings.join(', ')}`;
        }
        
        showToast(message, 'success');
        
        // Reload scanner stats
        const scannerResponse = await apiService.scanner.getStats({ 
          date: apiService.utils.getCurrentDate() 
        });
        setScannerStats(scannerResponse.data);
      } else {
        showToast('Failed to mark attendance', 'error');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      showToast(error.response?.data?.error || 'Scan failed', 'error');
    } finally {
      setIsScanning(false);
      setShowScanner(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Mess Management System</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Active Users"
          value={stats?.active_users || 0}
          icon={UsersIcon}
          color="blue"
        />
        <StatsCard
          title="Tomorrow's Mess Cuts"
          value={stats?.mess_cuts_tomorrow || 0}
          icon={ScissorsIcon}
          color="orange"
        />
        <StatsCard
          title="Unpaid Bills"
          value={stats?.unpaid_bills || 0}
          icon={DocumentTextIcon}
          color="red"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={CurrencyRupeeIcon}
          color="green"
        />
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">QR Scanner</h3>
            <p className="text-sm text-gray-600">
              Current meal: {currentMeal ? (
                <span className="capitalize font-medium text-blue-600">{currentMeal}</span>
              ) : (
                <span className="text-red-600">Outside meal hours</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            disabled={!currentMeal || isScanning}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              currentMeal && !isScanning
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <QrCodeIcon className="w-5 h-5" />
            Scan QR
          </button>
        </div>

        {/* Today's Meal Stats */}
        {scannerStats && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Breakfast</p>
              <p className="text-lg font-bold text-orange-700">
                {scannerStats.breakfast?.scanned || 0}/{scannerStats.breakfast?.total || 0}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Lunch</p>
              <p className="text-lg font-bold text-blue-700">
                {scannerStats.lunch?.scanned || 0}/{scannerStats.lunch?.total || 0}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Dinner</p>
              <p className="text-lg font-bold text-purple-700">
                {scannerStats.dinner?.scanned || 0}/{scannerStats.dinner?.total || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Time Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <ClockIcon className="w-5 h-5" />
          <span className="text-sm">
            Server Time (Asia/Kolkata): {new Date().toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour12: true,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerComponent
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
          isScanning={isScanning}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
