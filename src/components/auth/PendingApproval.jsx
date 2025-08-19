import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { 
  ClockIcon, 
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const PendingApproval = ({ registrationData }) => {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClockIcon className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-telegram-text mb-2">
            Registration Submitted
          </h1>
          <p className="text-telegram-hint">
            Your registration is pending admin approval
          </p>
        </div>

        {/* Registration Summary */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-telegram-text mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Registration Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-telegram-hint" />
              <div>
                <p className="text-telegram-hint text-sm">Name</p>
                <p className="text-telegram-text font-medium">{registrationData?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <BuildingOfficeIcon className="w-5 h-5 text-telegram-hint" />
              <div>
                <p className="text-telegram-hint text-sm">Department</p>
                <p className="text-telegram-text font-medium">{registrationData?.department}</p>
              </div>
            </div>
            
            {registrationData?.year_of_study && (
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-telegram-hint" />
                <div>
                  <p className="text-telegram-hint text-sm">Year of Study</p>
                  <p className="text-telegram-text font-medium">{registrationData.year_of_study}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-telegram-hint" />
              <div>
                <p className="text-telegram-hint text-sm">Mobile Number</p>
                <p className="text-telegram-text font-medium">{registrationData?.mobile_number}</p>
              </div>
            </div>
            
            {registrationData?.room_no && (
              <div className="flex items-center gap-3">
                <HomeIcon className="w-5 h-5 text-telegram-hint" />
                <div>
                  <p className="text-telegram-hint text-sm">Room Number</p>
                  <p className="text-telegram-text font-medium">{registrationData.room_no}</p>
                </div>
              </div>
            )}
            
            {registrationData?.mess_no && (
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-telegram-hint" />
                <div>
                  <p className="text-telegram-hint text-sm">Assigned Mess Number</p>
                  <p className="text-telegram-text font-medium font-mono">{registrationData.mess_no}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Information */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-telegram-text mb-3">What's Next?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-telegram-text font-medium">Admin Review</p>
                <p className="text-telegram-hint">Admin will review your registration details</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gray-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-telegram-text font-medium">Approval Notification</p>
                <p className="text-telegram-hint">You'll receive a notification once approved</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-gray-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-telegram-text font-medium">Access Granted</p>
                <p className="text-telegram-hint">Full access to mess management features</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="card mb-6 bg-blue-500/10 border-blue-500">
          <h3 className="text-blue-400 font-semibold mb-2">Important Notes</h3>
          <ul className="space-y-1 text-sm text-telegram-hint">
            <li>• Keep this Telegram app accessible for notifications</li>
            <li>• Admin approval typically takes 24-48 hours</li>
            <li>• Contact admin if you don't hear back within 3 days</li>
            <li>• Ensure your mobile number is correct for verification</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-secondary"
          >
            Check Status
          </button>
          
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6">
          <p className="text-telegram-hint text-sm">
            Need help? Contact the mess admin through official channels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
