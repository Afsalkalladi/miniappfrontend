import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/apiService';
import { showError, showSuccess } from '../../utils/errorHandler';
import LoadingSpinner from '../common/LoadingSpinner';

const StaffScanner = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [currentMeal, setCurrentMeal] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    setCurrentMeal(apiService.utils.getCurrentMealType());
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.staff.getScannerDashboard();
      setDashboardData(data);
    } catch (error) {
      showError('Failed to load scanner dashboard', error.message);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      showError('Failed to access camera', error.message);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const markAttendanceManual = async () => {
    if (!manualEntry.trim()) {
      showError('Please enter a mess number');
      return;
    }

    try {
      await apiService.staff.markAttendance(manualEntry, true);
      showSuccess(`Attendance marked for ${manualEntry}`);
      setManualEntry('');
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to mark attendance', error.message);
    }
  };

  const markAttendanceQR = async (messNo) => {
    try {
      await apiService.staff.markAttendance(messNo, false);
      showSuccess(`Attendance marked for ${messNo}`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to mark attendance', error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Scanner</h1>
              <p className="text-gray-600">
                Current Meal: <span className="font-semibold capitalize">{currentMeal}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Staff: {dashboardData?.staff_info?.name}</p>
              <p className="text-sm text-gray-600">Date: {dashboardData?.current_date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        <div id="error-container" style={{ display: 'none' }}></div>
        <div id="success-container" style={{ display: 'none' }}></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Interface */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">QR Scanner</h2>
            
            <div className="scanner-interface">
              {/* Camera View */}
              <div className="scanner-camera mb-6">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ display: scanning ? 'block' : 'none' }}
                  />
                  {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">📷</div>
                        <p>Camera not active</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scanner Overlay */}
                  {scanning && (
                    <div className="scanner-overlay absolute inset-0 flex items-center justify-center">
                      <div className="scanner-frame border-2 border-white rounded-lg w-48 h-48 relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scanner Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                {!scanning ? (
                  <button
                    onClick={startScanning}
                    className="scanner-button bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl hover:bg-blue-700 transition-colors"
                  >
                    📷
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="scanner-button bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl hover:bg-red-700 transition-colors"
                  >
                    ⏹️
                  </button>
                )}
              </div>

              {/* Manual Entry */}
              <div className="manual-entry">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                    placeholder="Enter Mess Number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={markAttendanceManual}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance</h2>
              {dashboardData?.today_attendance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {dashboardData.today_attendance.total_scans}
                      </div>
                      <div className="text-sm text-gray-600">Total Scans</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {dashboardData.today_attendance.unique_students}
                      </div>
                      <div className="text-sm text-gray-600">Unique Students</div>
                    </div>
                  </div>

                  {/* Meal Breakdown */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Meal Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold text-orange-600">
                          {dashboardData.today_attendance.meal_breakdown?.breakfast || 0}
                        </div>
                        <div className="text-xs text-gray-600">Breakfast</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-blue-600">
                          {dashboardData.today_attendance.meal_breakdown?.lunch || 0}
                        </div>
                        <div className="text-xs text-gray-600">Lunch</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-purple-600">
                          {dashboardData.today_attendance.meal_breakdown?.dinner || 0}
                        </div>
                        <div className="text-xs text-gray-600">Dinner</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Scans</h2>
              <div className="recent-scans space-y-3">
                {dashboardData?.recent_scans?.length > 0 ? (
                  dashboardData.recent_scans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{scan.student_info?.name}</div>
                        <div className="text-sm text-gray-600">
                          {scan.mess_no} • {scan.student_info?.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold capitalize text-blue-600">
                          {scan.meal_type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(scan.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent scans
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffScanner;
