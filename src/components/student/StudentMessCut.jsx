import React, { useState, useEffect } from 'react';
import {
  ScissorsIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentMessCut = ({ showToast }) => {
  const [messCuts, setMessCuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [stats, setStats] = useState({
    total_used: 0,
    remaining: 10,
    can_apply: true
  });

  const [applyForm, setApplyForm] = useState({
    from_date: '',
    to_date: ''
  });

  useEffect(() => {
    loadMessCuts();
  }, []);

  const loadMessCuts = async () => {
    try {
      setLoading(true);
      const response = await apiService.students.getMyMessCuts();
      const messCutsData = Array.isArray(response) ? response : (response?.mess_cuts || response?.data || []);
      setMessCuts(messCutsData);
      
      // Use stats from API response if available
      if (response?.stats) {
        setStats(response.stats);
      } else {
        // Fallback calculation
        const totalUsed = messCutsData?.length || 0;
        setStats({
          total_used: totalUsed,
          remaining: Math.max(0, 10 - totalUsed),
          can_apply: totalUsed < 10 && apiService.utils.canTakeMessCut()
        });
      }
    } catch (error) {
      console.error('Failed to load mess cuts:', error);
      showToast?.('Failed to load mess cuts', 'error');
      setMessCuts([]);
    } finally {
      setLoading(false);
    }
  };

  const validateMessCutDates = (fromDate, toDate) => {
    const errors = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Check if it's before 9 PM
    if (!apiService.utils.canTakeMessCut()) {
      errors.push('Mess cuts can only be applied before 9:00 PM');
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    // Must be future dates only (tomorrow onwards)
    if (from <= today.setHours(23, 59, 59, 999)) {
      errors.push('Mess cuts can only be applied for future dates (tomorrow onwards)');
    }
    
    if (to < from) {
      errors.push('To date must be after from date');
    }

    // Calculate days
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays > (10 - stats.total_used)) {
      errors.push(`You can only apply for ${10 - stats.total_used} more days`);
    }

    return { isValid: errors.length === 0, errors, days: diffDays };
  };

  const calculateGrantedDays = (requestedDays) => {
    // Auto-approval logic as per requirements
    if (requestedDays <= 4) {
      return Math.max(0, requestedDays - 1); // n-1 for less than 4
    } else {
      return requestedDays; // Full days for 4 or more
    }
  };

  const handleApplyMessCut = async (e) => {
    e.preventDefault();
    
    const validation = validateMessCutDates(applyForm.from_date, applyForm.to_date);
    
    if (!validation.isValid) {
      showToast?.(validation.errors[0], 'error');
      return;
    }

    try {
      setLoading(true);
      
      const grantedDays = calculateGrantedDays(validation.days);
      
      await apiService.students.applyMessCut(
        applyForm.from_date,
        applyForm.to_date,
        applyForm.reason
      );
      
      showToast?.(
        `Mess cut applied successfully! ${grantedDays} days granted out of ${validation.days} requested.`,
        'success'
      );
      
      setShowApplyForm(false);
      setApplyForm({ from_date: '', to_date: '', reason: '' });
      loadMessCuts();
      
    } catch (error) {
      console.error('Failed to apply mess cut:', error);
      showToast?.(error.message || 'Failed to apply mess cut', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ScissorsIcon className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mess Cuts</h1>
          <p className="text-gray-600 mt-2">Manage your mess leave applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
                <ScissorsIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Used</h3>
                <p className="text-lg font-bold text-gray-900">{stats.total_used}/10</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Remaining</h3>
                <p className="text-lg font-bold text-gray-900">{stats.remaining}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Warning */}
        {!apiService.utils.canTakeMessCut() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Application Closed</h4>
                <p className="text-red-700 text-sm">
                  Mess cut applications are only accepted before 9:00 PM (Asia/Kolkata time).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Apply Button */}
        {stats.can_apply && stats.remaining > 0 && (
          <button
            onClick={() => setShowApplyForm(true)}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <ScissorsIcon className="w-5 h-5" />
            Apply for Mess Cut
          </button>
        )}

        {/* Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-2">📋 Mess Cut Rules</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Maximum 10 mess cuts per month</li>
            <li>• Apply before 9:00 PM daily (Asia/Kolkata time)</li>
            <li>• Only future dates allowed (tomorrow onwards)</li>
            <li>• For ≤3 days: Get (n-1) days approved</li>
            <li>• For ≥4 days: Get full days approved</li>
            <li>• No editing once applied</li>
          </ul>
        </div>

        {/* Mess Cuts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Your Mess Cuts</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : messCuts.length === 0 ? (
            <div className="p-8 text-center">
              <ScissorsIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No mess cuts applied yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {messCuts.map((cut, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(cut.from_date).toLocaleDateString()} - {new Date(cut.to_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cut.status)}`}>
                      {cut.status || 'Approved'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Requested: {cut.total_days || 1} days</span>
                    <span>Granted: {cut.approved_days || cut.total_days || 1} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apply Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Apply for Mess Cut</h3>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleApplyMessCut} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={applyForm.from_date}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, from_date: e.target.value }))}
                    min={(() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={applyForm.to_date}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, to_date: e.target.value }))}
                    min={applyForm.from_date || (() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      return tomorrow.toISOString().split('T')[0];
                    })()}
                    max={(() => {
                      if (!applyForm.from_date) return undefined;
                      const fromDate = new Date(applyForm.from_date);
                      const maxDate = new Date(fromDate);
                      maxDate.setDate(fromDate.getDate() + stats.remaining - 1);
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>


                {/* Preview calculation */}
                {applyForm.from_date && applyForm.to_date && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Preview:</strong> {(() => {
                        const validation = validateMessCutDates(applyForm.from_date, applyForm.to_date);
                        if (validation.isValid) {
                          const granted = calculateGrantedDays(validation.days);
                          return `${granted} days will be granted out of ${validation.days} requested`;
                        }
                        return validation.errors[0];
                      })()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentMessCut;
