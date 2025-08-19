import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/apiService';
import { 
  QrCodeIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const QRCodeManager = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const student = user?.student;

  const handleRegenerateQR = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await apiService.student.regenerateQR();
      
      // Update user data with new QR code
      // You might want to refresh the user data here
      
      setMessage('QR code regenerated successfully!');
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      // Refresh page after 2 seconds to show new QR
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to regenerate QR code');
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="p-4 pb-20">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-telegram-text text-lg font-medium mb-2">No Student Profile</h3>
          <p className="text-telegram-hint">Please complete your registration first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">My QR Code</h1>
        <p className="text-telegram-hint">Use this QR code for mess attendance</p>
      </div>

      {/* Student Info */}
      <div className="card mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-telegram-text mb-2">{student.name}</h3>
          <p className="text-telegram-hint">Mess No: {student.mess_no}</p>
          <p className="text-telegram-hint">{student.department}</p>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="card text-center mb-6">
        {student.qr_code ? (
          <div>
            <div className="bg-white p-6 rounded-lg inline-block mb-4">
              <img 
                src={student.qr_code} 
                alt="Student QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-telegram-hint text-sm mb-4">
              Show this QR code to staff for attendance marking
            </p>
            
            {/* Regenerate Button */}
            <button
              onClick={handleRegenerateQR}
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Regenerating...' : 'Regenerate QR Code'}
            </button>
          </div>
        ) : (
          <div className="py-8">
            <QrCodeIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h3 className="text-telegram-text text-lg font-medium mb-2">No QR Code</h3>
            <p className="text-telegram-hint mb-4">
              Your QR code will be generated after admin approval
            </p>
            
            {student.is_approved && (
              <button
                onClick={handleRegenerateQR}
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <QrCodeIcon className="w-5 h-5" />
                Generate QR Code
              </button>
            )}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`card border ${
          message.includes('success') 
            ? 'bg-green-500/20 border-green-500' 
            : 'bg-red-500/20 border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {message.includes('success') ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            )}
            <p className={`font-medium ${
              message.includes('success') ? 'text-green-400' : 'text-red-400'
            }`}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-telegram-text mb-3">Instructions</h3>
        <ul className="space-y-2 text-telegram-hint text-sm">
          <li>• Show this QR code to mess staff for attendance</li>
          <li>• Keep your QR code secure and don't share screenshots</li>
          <li>• Regenerate if you suspect misuse</li>
          <li>• Contact admin if you face any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeManager;
