import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  HomeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StaffQRScanner = ({ onBack }) => {
  const [scanning, setScanning] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMessNo, setManualMessNo] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);

  const getCurrentMeal = () => {
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hour = kolkataTime.getHours();
    
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    return 'dinner';
  };

  const getCurrentDate = () => {
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    return kolkataTime.toISOString().split('T')[0];
  };

  const handleQRScan = async (result) => {
    if (!result || loading) return;

    try {
      setLoading(true);
      setError(null);
      setScanning(false);

      console.log('🔍 QR Code scanned:', result);

      // Extract mess number from QR code
      let messNo;
      try {
        // Try to parse as JSON first
        const qrData = JSON.parse(result);
        messNo = qrData.mess_no || qrData.messNo;
      } catch {
        // If not JSON, try to extract number directly
        const match = result.match(/\d+/);
        messNo = match ? match[0] : result;
      }
      
      console.log('🎯 Final mess number to lookup:', messNo);

      // Get student information with mess cut and bill status
      const response = await apiService.staff.getStudentInfo(messNo);
      console.log('📋 Student info response:', response);
      setStudentInfo(response);
      setShowStudentModal(true);

    } catch (error) {
      console.error('❌ Failed to get student info:', error);
      console.error('❌ Error details:', error.response?.data);

      // More detailed error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get student information';
      const statusCode = error.response?.status;
      const fullError = statusCode ? `${statusCode}: ${errorMessage}` : errorMessage;

      setError(`Student Lookup Failed: ${fullError}\n\nMess Number: ${messNo || 'Unknown'}`);

      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const attendanceData = {
        mess_no: studentInfo.mess_no,
        meal_type: getCurrentMeal(),
        date: getCurrentDate()
      };
      
      console.log('🔄 Marking attendance:', attendanceData);
      
      const response = await apiService.staff.markAttendance(attendanceData);
      console.log('✅ Attendance marked:', response);
      
      setAttendanceMarked(true);
      
      // Play success sound if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
    } catch (error) {
      console.error('❌ Failed to mark attendance:', error);
      console.error('❌ Error details:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to mark attendance';
      setError(`Attendance Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    setStudentInfo(null);
    setAttendanceMarked(false);
    setError(null);
    setShowManualEntry(false);
    setManualMessNo('');
    setShowStudentModal(false);
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
      setShowManualEntry(false);

      console.log('🔍 Manual entry for mess number:', manualMessNo);

      // Get student information
      const response = await apiService.staff.getStudentInfo(manualMessNo.trim());
      console.log('📋 Student info response:', response);
      setStudentInfo(response);
      setShowStudentModal(true);

    } catch (error) {
      console.error('❌ Failed to get student info:', error);
      setError(`Student Lookup Failed: ${error.response?.data?.error || error.message}\n\nMess Number: ${manualMessNo}`);
      setShowManualEntry(true);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent mx-auto mb-4"></div>
          <p className="text-telegram-text">Processing...</p>
        </div>
      </div>
    );
  }

  if (error && !studentInfo) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-medium mb-2">Scan Error</h3>
          <div className="text-red-300 text-sm mb-4 text-left bg-red-500/20 p-3 rounded-lg">
            <pre className="whitespace-pre-wrap text-xs">{error}</pre>
          </div>
          <div className="text-telegram-hint text-xs mb-4">
            💡 Tips:
            <ul className="text-left mt-2 space-y-1">
              <li>• Ensure good lighting</li>
              <li>• Hold camera steady</li>
              <li>• Make sure QR code is clear</li>
              <li>• Try scanning again</li>
            </ul>
          </div>
          <button onClick={handleScanAnother} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-telegram-text">QR Scanner</h1>
            <p className="text-telegram-hint">Scan student QR code for {getCurrentMeal()}</p>
          </div>
        </div>

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
          
          {/* Stop Scanning Button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setScanning(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Stop Scanning
            </button>
          </div>
        </div>

        {/* Manual Entry Option */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
          <h4 className="text-yellow-400 font-medium mb-2">✍️ Manual Entry</h4>
          <p className="text-yellow-300 text-sm mb-3">Can't scan QR code? Enter mess number manually:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualMessNo}
              onChange={(e) => setManualMessNo(e.target.value)}
              placeholder="Enter mess number"
              className="flex-1 px-3 py-2 bg-telegram-bg border border-gray-600 rounded-lg text-telegram-text placeholder-telegram-hint"
              onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
            />
            <button
              onClick={handleManualEntry}
              disabled={loading || !manualMessNo.trim()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">📱 Scanning Instructions</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Point camera at student's QR code</li>
            <li>• Ensure good lighting for clear scan</li>
            <li>• Hold steady until scan completes</li>
            <li>• Student information will appear automatically</li>
          </ul>
        </div>
      </div>
    );
  }

  // Student Modal Component
  const StudentModal = () => {
    if (!studentInfo) return null;

    const currentMeal = getCurrentMeal();
    const today = getCurrentDate();
    const isOnMessCut = Array.isArray(studentInfo.mess_cuts) && studentInfo.mess_cuts.some(cut => {
      return cut.from_date <= today && cut.to_date >= today && cut.status === 'approved';
    });

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-telegram-secondary rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-600">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h2 className="text-lg font-bold text-telegram-text">Student Info - {currentMeal} {getMealIcon(currentMeal)}</h2>
            <button
              onClick={() => setShowStudentModal(false)}
              className="p-1 text-telegram-hint hover:text-telegram-text"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 space-y-4">
            {/* Student Profile */}
            <div className="flex items-center gap-4 p-4 bg-telegram-bg rounded-lg">
              <div className="w-16 h-16 bg-telegram-accent rounded-full flex items-center justify-center overflow-hidden">
                {studentInfo.profile_image ? (
                  <img 
                    src={studentInfo.profile_image} 
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-16 h-16 bg-telegram-accent rounded-full flex items-center justify-center ${studentInfo.profile_image ? 'hidden' : 'flex'}`}>
                  <span className="text-white font-bold text-xl">
                    {studentInfo.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-telegram-text">{studentInfo.name || 'Unknown Student'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-telegram-accent/20 text-telegram-accent rounded text-sm font-mono">
                    {studentInfo.mess_no || 'N/A'}
                  </span>
                  {studentInfo.is_approved ? (
                    <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-sm">
                      ✅ Approved
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded text-sm">
                      ❌ Not Approved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Dept:</span>
                <span className="text-telegram-text">{studentInfo.department || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Room:</span>
                <span className="text-telegram-text">{studentInfo.room_no || 'N/A'}</span>
              </div>
            </div>

            {/* Mess Cut Status */}
            {isOnMessCut && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <h4 className="text-red-400 font-medium mb-2">⚠️ Mess Cut Active</h4>
                <div className="text-red-300 text-sm space-y-1">
                  {studentInfo.mess_cuts?.map((cut, index) => (
                    <div key={index}>
                      📅 {formatDate(cut.from_date)} to {formatDate(cut.to_date)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bills Status */}
            {studentInfo.unpaid_bills_count > 0 && (
              <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-3">
                <h4 className="text-orange-400 font-medium">💰 Unpaid Bills: {studentInfo.unpaid_bills_count}</h4>
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
              {attendanceMarked ? (
                <div className="flex-1 text-center">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 mb-3">
                    <h4 className="text-green-400 font-medium">✅ Attendance Marked Successfully!</h4>
                    <p className="text-green-300 text-sm">For {currentMeal} on {formatDate(getCurrentDate())}</p>
                  </div>
                  <button
                    onClick={handleScanAnother}
                    className="w-full bg-telegram-accent text-white py-3 rounded-lg font-medium"
                  >
                    Scan Another Student
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium"
                  >
                    Back to Scanner
                  </button>
                  <button
                    onClick={handleMarkAttendance}
                    disabled={loading || isOnMessCut}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      isOnMessCut 
                        ? 'bg-red-600 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Marking...' : isOnMessCut ? 'Cannot Mark (Mess Cut)' : 'Mark Attendance'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
        >
          <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">QR Scanner</h1>
          <p className="text-telegram-hint">Scan student QR code for {getCurrentMeal()}</p>
        </div>
      </div>

      {/* Show Modal if student info exists */}
      {showStudentModal && <StudentModal />}

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
            
            {/* Stop Scanning Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setScanning(false)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
            <h4 className="text-yellow-400 font-medium mb-2">✍️ Manual Entry</h4>
            <p className="text-yellow-300 text-sm mb-3">Can't scan QR code? Enter mess number manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualMessNo}
                onChange={(e) => setManualMessNo(e.target.value)}
                placeholder="Enter mess number"
                className="flex-1 px-3 py-2 bg-telegram-bg border border-gray-600 rounded-lg text-telegram-text placeholder-telegram-hint"
                onKeyPress={(e) => e.key === 'Enter' && handleManualEntry()}
              />
              <button
                onClick={handleManualEntry}
                disabled={loading || !manualMessNo.trim()}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">📱 Scanning Instructions</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Point camera at student's QR code</li>
              <li>• Ensure good lighting for clear scan</li>
              <li>• Hold steady until scan completes</li>
              <li>• Student information will appear automatically</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setScanning(true)}
            className="bg-telegram-accent text-white px-6 py-3 rounded-lg font-medium"
          >
            Start Scanning
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffQRScanner;
              <h4 className="text-green-400 font-medium mb-2">✅ Attendance Marked!</h4>
              <p className="text-green-300 text-sm mb-4">
                {currentMeal} attendance recorded for {studentInfo.name}
              </p>
              <button
                onClick={handleScanAnother}
                className="btn-primary w-full"
              >
                Scan Next Student
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-3">{getMealIcon(currentMeal)}</div>
              <h4 className="text-telegram-text font-medium mb-2">Mark {currentMeal} Attendance</h4>
              <p className="text-telegram-hint text-sm mb-4">
                Confirm {studentInfo.name}'s entry for {currentMeal}
              </p>
              
              {/* Show mess cut warning if applicable */}
              {isOnMessCut ? (
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setError('❌ Cannot mark attendance: Student is on mess cut!');
                      setTimeout(() => setError(null), 3000);
                    }}
                    className="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold w-full flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Mark Attendance (Mess Cut Active)
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleMarkAttendance}
                  disabled={loading || !studentInfo.is_approved}
                  className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors w-full flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircleIcon className="w-5 h-5" />
                  )}
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              )}
              
              {!studentInfo.is_approved && (
                <p className="text-red-400 text-sm mt-2">
                  ⚠️ Student not approved - cannot mark attendance
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mt-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default StaffQRScanner;
