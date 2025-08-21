import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import QRScanner from '../common/QRScanner';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  QrCodeIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StaffScanner = ({ user, showToast }) => {
  const [scannerData, setScannerData] = useState({
    stats: null,
    loading: true,
    error: null
  });
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadScannerStats();
  }, []);

  const loadScannerStats = async () => {
    try {
      setScannerData(prev => ({ ...prev, loading: true }));
      
      const response = await apiService.scanner.getStats({
        date: apiService.utils.getCurrentDate()
      });

      setScannerData({
        stats: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load scanner stats:', error);
      setScannerData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load scanner stats'
      }));
      showToast('Failed to load scanner stats', 'error');
    }
  };

  const handleScan = async (result) => {
    if (!result) return;

    try {
      setIsScanning(true);
      setScanResult(null);

      const response = await apiService.scanner.scanStudent({
        qr_data: result,
        meal_type: apiService.utils.getCurrentMeal(),
        date: apiService.utils.getCurrentDate()
      });

      setScanResult({
        success: true,
        student: response.data.student,
        message: response.data.message,
        meal_type: response.data.meal_type
      });

      showToast(`✅ ${response.data.message}`, 'success');
      
      // Refresh stats after successful scan
      loadScannerStats();

    } catch (error) {
      console.error('Scan failed:', error);
      const errorMessage = error.response?.data?.error || 'Scan failed';
      
      setScanResult({
        success: false,
        message: errorMessage
      });

      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanError = (error) => {
    console.error('QR Scanner error:', error);
    showToast('QR Scanner error. Please try again.', 'error');
  };

  if (scannerData.loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading scanner..." />
      </div>
    );
  }

  const { stats } = scannerData;
  const currentMeal = apiService.utils.getCurrentMeal();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Scanner</h1>
        <p className="text-gray-600">Scan student QR codes for mess entry</p>
        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          Current Meal: {currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Today's Scans"
          value={stats?.total_scans_today || 0}
          icon={QrCodeIcon}
          color="blue"
        />
        <StatsCard
          title="Current Meal"
          value={stats?.current_meal_scans || 0}
          icon={UserGroupIcon}
          color="green"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats?.success_rate || 100}%`}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title="Failed Scans"
          value={stats?.failed_scans_today || 0}
          icon={XCircleIcon}
          color="red"
        />
      </div>

      {/* QR Scanner */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Scan Student QR Code
        </h3>
        
        <QRScanner
          onScan={handleScan}
          onError={handleScanError}
          isScanning={isScanning}
        />

        {isScanning && (
          <div className="mt-4 text-center">
            <LoadingSpinner text="Processing scan..." />
          </div>
        )}
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className={`rounded-xl p-6 shadow-sm border ${
          scanResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {scanResult.success ? (
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            ) : (
              <XCircleIcon className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h4 className={`font-semibold ${
                scanResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
              </h4>
              <p className={`text-sm ${
                scanResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {scanResult.message}
              </p>
            </div>
          </div>

          {scanResult.success && scanResult.student && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h5 className="font-medium text-gray-900 mb-2">Student Details</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900">{scanResult.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mess No:</span>
                  <span className="text-gray-900">{scanResult.student.mess_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="text-gray-900">{scanResult.student.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meal:</span>
                  <span className="text-gray-900 capitalize">{scanResult.meal_type}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Point camera at student's QR code</li>
          <li>• Ensure good lighting for best results</li>
          <li>• QR code will be scanned automatically</li>
          <li>• Check scan result before allowing entry</li>
        </ul>
      </div>
    </div>
  );
};

export default StaffScanner;
