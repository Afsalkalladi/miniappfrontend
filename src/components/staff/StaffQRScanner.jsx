import React, { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { 
  UserIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StaffQRScanner = ({ onBack }) => {
  const [scanning, setScanning] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

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
      
      const attendanceData = {
        mess_no: studentInfo.mess_no,
        meal_type: getCurrentMeal(),
        date: getCurrentDate()
      };
      
      await apiService.staff.markAttendance(attendanceData);
      setAttendanceMarked(true);
      
      // Play success sound if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
    } catch (error) {
      console.error('❌ Failed to mark attendance:', error);
      setError(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAnother = () => {
    setStudentInfo(null);
    setAttendanceMarked(false);
    setError(null);
    setScanning(true);
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

  if (studentInfo) {
    const currentMeal = getCurrentMeal();

    // Safely check for mess cuts
    const today = getCurrentDate();
    const isOnMessCut = Array.isArray(studentInfo.mess_cuts) && studentInfo.mess_cuts.some(cut => {
      return cut.from_date <= today && cut.to_date >= today && cut.status === 'approved';
    });

    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
            >
              <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-telegram-text">Student Information</h1>
              <p className="text-telegram-hint">Scanned for {currentMeal} {getMealIcon(currentMeal)}</p>
            </div>
          </div>
          
          <button
            onClick={handleScanAnother}
            className="btn-secondary"
          >
            Scan Another
          </button>
        </div>

        {/* Student Profile Card */}
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-telegram-accent rounded-full flex items-center justify-center">
              {studentInfo.profile_image ? (
                <img 
                  src={studentInfo.profile_image} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {studentInfo.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-telegram-text">{studentInfo.name || 'Unknown Student'}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Department:</span>
                <span className="text-telegram-text">{studentInfo.department || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Room:</span>
                <span className="text-telegram-text">{studentInfo.room_no || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Mobile:</span>
                <span className="text-telegram-text">{studentInfo.mobile_number || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-telegram-hint" />
                <span className="text-telegram-hint">Year:</span>
                <span className="text-telegram-text">{studentInfo.year_of_study || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mess Cut Status */}
        {isOnMessCut ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <XCircleIcon className="w-6 h-6 text-red-400" />
              <h4 className="text-red-400 font-medium">❌ MESS CUT ACTIVE</h4>
            </div>
            <p className="text-red-300 text-sm mb-3">
              This student is currently on mess cut and should not be allowed entry.
            </p>
            {Array.isArray(studentInfo.mess_cuts) && studentInfo.mess_cuts
              .filter(cut => {
                return cut.from_date <= today && cut.to_date >= today && cut.status === 'approved';
              })
              .map((cut, index) => (
                <div key={index} className="bg-red-400/20 rounded p-2 text-sm">
                  <div className="text-red-300">
                    <strong>Period:</strong> {cut.from_date ? formatDate(cut.from_date) : 'Unknown'} - {cut.to_date ? formatDate(cut.to_date) : 'Unknown'}
                  </div>
                  <div className="text-red-300">
                    <strong>Reason:</strong> {cut.reason || 'No reason provided'}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <h4 className="text-green-400 font-medium">✅ MESS ENTRY ALLOWED</h4>
            </div>
            <p className="text-green-300 text-sm">
              Student is not on mess cut and can enter the mess.
            </p>
          </div>
        )}

        {/* Bill Payment Status */}
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
          <h4 className="text-telegram-text font-medium mb-3 flex items-center gap-2">
            <CurrencyRupeeIcon className="w-5 h-5" />
            Payment Status
          </h4>
          
          {Array.isArray(studentInfo.bills) && studentInfo.bills.length > 0 ? (
            <div className="space-y-2">
              {studentInfo.bills.slice(0, 3).map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-telegram-bg rounded">
                  <div>
                    <span className="text-telegram-text text-sm">
                      {bill.month ? formatDate(bill.month) : 'Unknown'} - ₹{bill.amount || 0}
                    </span>
                  </div>
                  <div>
                    {bill.status === 'paid' ? (
                      <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs">
                        ✅ Paid
                      </span>
                    ) : bill.status === 'payment_submitted' ? (
                      <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs">
                        ⏳ Pending
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded text-xs">
                        ❌ Unpaid
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {(studentInfo.unpaid_bills_count || 0) > 0 && (
                <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded">
                  <p className="text-red-400 text-sm">
                    ⚠️ {studentInfo.unpaid_bills_count} unpaid bill{studentInfo.unpaid_bills_count !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-telegram-hint text-sm">No bill information available</p>
          )}
        </div>

        {/* Attendance Action */}
        {!isOnMessCut && studentInfo.is_approved && (
          <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600">
            {attendanceMarked ? (
              <div className="text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
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
                <button
                  onClick={handleMarkAttendance}
                  disabled={loading}
                  className="bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircleIcon className="w-5 h-5" />
                  )}
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            )}
          </div>
        )}

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
