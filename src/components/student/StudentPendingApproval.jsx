import React from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const StudentPendingApproval = ({ registrationData }) => {
  console.log('⏳ StudentPendingApproval component loaded');
  console.log('📋 Registration data:', registrationData);

  const handleCheckStatus = () => {
    console.log('🔄 Checking approval status...');
    // This will trigger a re-check of the user's approval status
    window.location.reload();
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
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

        {/* Status Card */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-medium">Pending Approval</h3>
              <p className="text-yellow-300 text-sm">Please wait for admin verification</p>
            </div>
          </div>
          <div className="text-sm text-yellow-200">
            <p>• Your registration has been submitted successfully</p>
            <p>• An admin will review your details</p>
            <p>• You'll receive access once approved</p>
            <p>• This usually takes 24-48 hours</p>
          </div>
        </div>

        {/* Registration Summary */}
        {registrationData && (
          <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
            <h3 className="text-lg font-semibold text-telegram-text mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              Registration Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-telegram-hint" />
                <div>
                  <p className="text-telegram-hint text-sm">Name</p>
                  <p className="text-telegram-text font-medium">{registrationData.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-telegram-hint flex items-center justify-center">
                  #
                </div>
                <div>
                  <p className="text-telegram-hint text-sm">Mess Number</p>
                  <p className="text-telegram-text font-medium">{registrationData.mess_no}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="w-5 h-5 text-telegram-hint" />
                <div>
                  <p className="text-telegram-hint text-sm">Department</p>
                  <p className="text-telegram-text font-medium">{registrationData.department}</p>
                </div>
              </div>
              
              {registrationData.year_of_study && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-telegram-hint flex items-center justify-center">
                    📚
                  </div>
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
                  <p className="text-telegram-text font-medium">{registrationData.mobile_number}</p>
                </div>
              </div>
              
              {registrationData.room_no && (
                <div className="flex items-center gap-3">
                  <HomeIcon className="w-5 h-5 text-telegram-hint" />
                  <div>
                    <p className="text-telegram-hint text-sm">Room Number</p>
                    <p className="text-telegram-text font-medium">{registrationData.room_no}</p>
                  </div>
                </div>
              )}
              
              {registrationData.is_sahara_inmate && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-telegram-hint flex items-center justify-center">
                    🏠
                  </div>
                  <div>
                    <p className="text-telegram-hint text-sm">Hostel</p>
                    <p className="text-telegram-text font-medium">Sahara Hostel Inmate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            className="w-full bg-telegram-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-telegram-accent/80"
          >
            Check Status
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6">
          <p className="text-telegram-hint text-sm">
            Need help? Contact the mess administrator
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h4 className="text-telegram-text font-medium mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Component: StudentPendingApproval</div>
            <div>Registration Data: {registrationData ? 'Present' : 'Missing'}</div>
            <div>Mess No: {registrationData?.mess_no || 'N/A'}</div>
            <div>Status: Pending Approval</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentPendingApproval;
