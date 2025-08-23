import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const QRScanner = ({ onBack }) => {
  const [scanning, setScanning] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [manualMessNo, setManualMessNo] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showDateMealSelector, setShowDateMealSelector] = useState(false);

  const getCurrentMeal = () => {
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hour = kolkataTime.getHours();
    
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    return 'dinner';
  };

  const handleQRScan = async (result) => {
    if (!result || loading) return;

    // Handle different QR scanner result formats
    let qrData;
    if (typeof result === 'string') {
      qrData = result;
    } else if (result[0]?.rawValue) {
      qrData = result[0].rawValue;
    } else if (result.text) {
      qrData = result.text;
    } else {
      console.error('Invalid QR result format:', result);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setScanning(false);

      console.log('🎯 QR Scan result:', qrData);

      // Parse secure QR code format (v2.0 only)
      let messNo;
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.version === '2.0' && parsed.mess_no && parsed.uuid && parsed.student_id && parsed.hash) {
          messNo = parsed.mess_no;
          console.log('🔒 Secure QR v2.0 detected:', parsed);
        } else {
          throw new Error('Invalid or outdated QR format. Please regenerate your QR code.');
        }
      } catch (parseError) {
        throw new Error('Invalid QR format. Only secure QR codes v2.0 are supported. Please regenerate your QR code.');
      }
      
      console.log('🎯 Final mess number to lookup:', messNo);

      const response = await apiService.staff.getStudentInfo(messNo);
      
      // Pass QR data to backend for validation
      const attendanceData = {
        mess_no: messNo,
        meal_type: selectedMeal,
        date: selectedDate,
        qr_data: qrData // Include QR data for security validation
      };
      console.log('📋 Student info response:', response);
      console.log('📋 Mess cuts data:', response.mess_cuts);
      console.log('📋 Bills data:', response.bills);
      // Store QR data with student info for later validation
      setStudentInfo({
        ...response,
        scanned_qr_data: qrData
      });
      setShowManualEntry(false);
      setShowDateMealSelector(false);

    } catch (error) {
      console.error('❌ Failed to get student info:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get student information';
      const statusCode = error.response?.status;
      const fullError = statusCode ? `${statusCode}: ${errorMessage}` : errorMessage;
      setError(`QR Scan Failed: ${fullError}\n\nScanned Data: ${qrData}`);
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!studentInfo) return;

    try {
      setLoading(true);
      setError(null);
      
      const attendanceData = {
        mess_no: studentInfo.mess_no,
        meal_type: selectedMeal,
        date: selectedDate,
        is_manual_entry: false,
        qr_data: studentInfo.scanned_qr_data || null // Include QR data for validation if available
      };
      console.log('🔄 Marking attendance:', attendanceData);
      
      const response = await apiService.staff.markAttendance(attendanceData);
      console.log('✅ Attendance marked:', response);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }

      // Auto-close modal and reset for next scan
      setTimeout(() => {
        handleScanAnother();
      }, 1000); // Show success for 1 second then reset

    } catch (error) {
      console.error('❌ Failed to mark attendance:', error);
      setError(error.response?.data?.error || error.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    setStudentInfo(null);
    setAttendanceMarked(false);
    setError(null);
    setManualMessNo('');
    setShowManualEntry(false);
    setShowDateMealSelector(false);
    setScanning(true);
  };

  const handleManualEntry = async () => {
    if (!manualMessNo.trim()) {
      setError('Please enter a mess number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setScanning(false);

      console.log('🔍 Manual entry for mess number:', manualMessNo);

      const response = await apiService.staff.getStudentInfo(manualMessNo.trim());
      console.log('📋 Student info response:', response);
      console.log('📋 Mess cuts data:', response.mess_cuts);
      console.log('📋 Bills data:', response.bills);
      // Manual entry doesn't have QR data
      setStudentInfo({
        ...response,
        scanned_qr_data: null
      });
      setShowManualEntry(false);
      setShowDateMealSelector(false);

    } catch (error) {
      console.error('❌ Failed to get student info:', error);
      setError(`Student Lookup Failed: ${error.response?.data?.error || error.message}\n\nMess Number: ${manualMessNo}`);
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StudentModal = () => {
    if (!studentInfo) return null;

    const currentMeal = selectedMeal || getCurrentMeal();
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-telegram-secondary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-600">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h2 className="text-lg font-bold text-telegram-text">Student Info - {currentMeal} {getMealIcon(currentMeal)}</h2>
            <button
              onClick={() => setStudentInfo(null)}
              className="p-1 text-telegram-hint hover:text-telegram-text"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 space-y-4">
            {/* Student Profile */}
            <div className="flex items-center gap-4 p-4 bg-telegram-bg rounded-lg">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {studentInfo.profile_image ? (
                  <img 
                    src={studentInfo.profile_image} 
                    alt={studentInfo.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${studentInfo.profile_image ? 'hidden' : 'flex'}`}>
                  {studentInfo.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-telegram-text">{studentInfo.name}</h3>
                <p className="text-telegram-hint">Mess No: {studentInfo.mess_no}</p>
                <p className="text-telegram-hint">{studentInfo.department} - Year {studentInfo.year_of_study}</p>
                <p className="text-telegram-hint">Room: {studentInfo.room_no}</p>
              </div>
            </div>

            {/* Mess Cut Status */}
            {studentInfo.mess_cuts && studentInfo.mess_cuts.length > 0 && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <h4 className="text-red-400 font-medium flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  On Mess Cut
                </h4>
                <p className="text-red-300 text-sm mt-1">
                  Active from {new Date(studentInfo.mess_cuts[0].from_date).toLocaleDateString()} to {new Date(studentInfo.mess_cuts[0].to_date).toLocaleDateString()}
                </p>
                <p className="text-red-300 text-sm">
                  Attendance cannot be marked during mess cut period.
                </p>
              </div>
            )}

            {/* Bills Status */}
            {studentInfo.unpaid_bills_count > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
                <h4 className="text-yellow-400 font-medium flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Outstanding Bills
                </h4>
                <p className="text-yellow-300 text-sm mt-1">
                  {studentInfo.unpaid_bills_count} unpaid bill{studentInfo.unpaid_bills_count > 1 ? 's' : ''} pending
                </p>
                {studentInfo.bills && studentInfo.bills.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {studentInfo.bills.filter(bill => bill.status === 'unpaid').slice(0, 2).map((bill, index) => (
                      <div key={index} className="text-yellow-300 text-xs">
                        {new Date(bill.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: ₹{bill.amount}
                        {bill.fine_amount > 0 && ` (+ ₹${bill.fine_amount} fine)`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Status - Good Standing */}
            {studentInfo.unpaid_bills_count === 0 && (
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
                <h4 className="text-green-400 font-medium flex items-center gap-2">
                  ✅ Payment Status: Good
                </h4>
                <p className="text-green-300 text-sm mt-1">
                  All bills are paid up to date
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <h4 className="text-red-400 font-medium mb-2">❌ Error</h4>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStudentInfo(null)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={loading || (studentInfo.mess_cuts && studentInfo.mess_cuts.length > 0)}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  (studentInfo.mess_cuts && studentInfo.mess_cuts.length > 0)
                    ? 'bg-red-600 text-white cursor-not-allowed' 
                    : loading 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-telegram-accent text-white hover:bg-blue-600'
                }`}
              >
                {loading ? 'Marking...' : (studentInfo.mess_cuts && studentInfo.mess_cuts.length > 0) ? 'On Mess Cut' : `Mark Attendance`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 bg-telegram-secondary rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-telegram-text">QR Scanner</h1>
          <p className="text-telegram-hint">Scan student QR code for {getCurrentMeal()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Show Modal if student info exists */}
      {studentInfo && <StudentModal />}

      {/* Main Scanner Interface */}
      {scanning ? (
        <>
          {/* QR Scanner */}
          <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
            <div className="aspect-square max-w-sm mx-auto">
              <QrScanner
                onDecode={handleQRScan}
                onError={(error) => console.error('QR Scanner error:', error)}
                constraints={{
                  facingMode: 'environment'
                }}
                containerStyle={{
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showManualEntry ? 'Hide Manual Entry' : 'Manual Entry'}
                </button>
                
                <button
                  onClick={() => setShowDateMealSelector(!showDateMealSelector)}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Date & Meal
                </button>
              </div>
              
              <button
                onClick={() => setScanning(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Stop Scanning
              </button>
            </div>

            {showManualEntry && (
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Manual Entry</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualMessNo}
                    onChange={(e) => setManualMessNo(e.target.value)}
                    placeholder="Enter mess number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleManualEntry}
                    disabled={!manualMessNo.trim()}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                  >
                    Scan
                  </button>
                </div>
              </div>
            )}

            {showDateMealSelector && (
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Date & Meal Selection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal</label>
                    <select
                      value={selectedMeal}
                      onChange={(e) => setSelectedMeal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-telegram-text mb-3">Instructions</h3>
            <ul className="text-telegram-hint space-y-1">
              <li>• Point camera at QR code</li>
              <li>• Use manual entry for backup</li>
              <li>• Select date and meal as needed</li>
              <li>• Student information will appear automatically</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="space-y-3">
            <button
              onClick={() => setScanning(true)}
              className="bg-telegram-accent text-white px-6 py-3 rounded-lg font-medium w-full"
            >
              Start Scanning
            </button>
            <button
              onClick={() => setShowManualEntry(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium w-full"
            >
              Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !studentInfo && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mt-4">
          <h4 className="text-red-400 font-medium mb-2">❌ Error</h4>
          <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScanning(true);
            }}
            className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-telegram-secondary rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-accent mx-auto mb-4"></div>
            <p className="text-telegram-text">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
