import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { apiService } from '../../services/apiService';
import { CheckCircleIcon, XCircleIcon, QrCodeIcon, UserIcon } from '@heroicons/react/24/outline';

const StaffPanel = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [mealType, setMealType] = useState('lunch');

  const handleScan = async (result) => {
    if (!result || !result[0]?.rawValue) return;

    try {
      setScanning(false);
      
      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(result[0].rawValue);
      } catch (parseError) {
        // If not JSON, assume it's just the mess number
        qrData = { mess_no: result[0].rawValue };
      }
      
      const response = await apiService.scanner.scanQR({
        mess_no: qrData.mess_no,
        meal_type: mealType,
        date: new Date().toISOString().split('T')[0],
      });

      setResult({
        success: true,
        student: response.data.student,
        attendance: response.data.attendance,
        message: response.data.message || 'Attendance marked successfully!'
      });

      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Failed to mark attendance'
      });
      
      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner error:', error);
    setResult({
      success: false,
      message: 'Camera access denied or not available'
    });
  };

  const startScanning = () => {
    setScanning(true);
    setResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">Staff Panel</h1>
          <p className="text-telegram-hint">QR Scanner for Attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-telegram-text font-medium">Staff User</p>
            <p className="text-green-400 text-sm">Staff Scanner</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.reload();
            }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meal Type Selection */}
      <div className="card mb-6">
        <label className="block text-telegram-text mb-2">Select Meal:</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="input"
          disabled={scanning}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      {/* Scanner */}
      {scanning ? (
        <div className="card relative mb-6">
          <div className="rounded-lg overflow-hidden">
            <QrScanner
              onDecode={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment'
              }}
              containerStyle={{
                width: '100%',
                height: '300px'
              }}
            />
          </div>
          <button
            onClick={stopScanning}
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Stop
          </button>
          <div className="absolute inset-0 pointer-events-none">
            <div className="flex items-center justify-center h-full">
              <div className="w-48 h-48 border-2 border-telegram-accent rounded-lg"></div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={startScanning}
          className="w-full btn-primary mb-6 flex items-center justify-center gap-2"
        >
          <QrCodeIcon className="w-6 h-6" />
          Start Scanning
        </button>
      )}

      {/* Result */}
      {result && (
        <div className={`card border ${
          result.success 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-red-500/20 border-red-500'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {result.success ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-400" />
            )}
            <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.message}
            </p>
          </div>
          
          {result.student && (
            <div className="mt-3 text-telegram-text">
              <p><strong>Student:</strong> {result.student.name}</p>
              <p><strong>Mess No:</strong> {result.student.mess_no}</p>
              <p><strong>Department:</strong> {result.student.department}</p>
              <p><strong>Meal:</strong> {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</p>
            </div>
          )}
          
          <button
            onClick={() => setResult(null)}
            className="mt-4 w-full btn-secondary"
          >
            Scan Another
          </button>
        </div>
      )}

      {/* Instructions */}
      {!scanning && !result && (
        <div className="card">
          <h3 className="text-lg font-semibold text-telegram-text mb-3">Instructions</h3>
          <ul className="space-y-2 text-telegram-hint text-sm">
            <li>• Select the appropriate meal type</li>
            <li>• Tap "Start Scanning" to activate camera</li>
            <li>• Point camera at student's QR code</li>
            <li>• Wait for automatic detection</li>
            <li>• Attendance will be marked instantly</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StaffPanel;
