import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentMessCuts = ({ user, showToast }) => {
  const [messCuts, setMessCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    loadMessCuts();
  }, []);

  const loadMessCuts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.messCuts.getStudentMessCuts();
      setMessCuts(response.data.mess_cuts || []);
    } catch (error) {
      console.error('Failed to load mess cuts:', error);
      setError('Failed to load mess cuts');
      showToast('Failed to load mess cuts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const calculateDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading mess cuts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-600 font-medium mb-2">Error Loading Mess Cuts</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button 
            onClick={loadMessCuts} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mess Cuts</h1>
          <p className="text-gray-600">Apply for mess leave</p>
        </div>
        
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Apply
        </button>
      </div>

      {/* Mess Cuts List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Mess Cut Applications</h3>
        
        {messCuts.length > 0 ? (
          <div className="space-y-4">
            {messCuts.map((cut) => (
              <div key={cut.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">
                      {new Date(cut.from_date).toLocaleDateString()} - {new Date(cut.to_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cut.status)}`}>
                    {getStatusIcon(cut.status)}
                    {cut.status.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-900">
                      {calculateDays(cut.from_date, cut.to_date)} day{calculateDays(cut.from_date, cut.to_date) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied</span>
                    <span className="text-gray-900">
                      {new Date(cut.applied_at).toLocaleDateString()}
                    </span>
                  </div>

                  {cut.processed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed</span>
                      <span className="text-gray-900">
                        {new Date(cut.processed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-gray-600 text-sm mb-1">Reason:</div>
                  <div className="text-gray-900 text-sm">{cut.reason}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-gray-900 font-medium mb-2">No Mess Cut Applications</h4>
            <p className="text-gray-600 mb-4">You haven't applied for any mess cuts yet.</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Apply for Mess Cut
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyMessCutModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            loadMessCuts();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// Apply Mess Cut Modal Component
const ApplyMessCutModal = ({ onClose, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.from_date || !formData.to_date || !formData.reason.trim()) {
      setError('All fields are required');
      return;
    }

    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      setError('From date cannot be after to date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await apiService.messCuts.applyMessCut({
        from_date: formData.from_date,
        to_date: formData.to_date,
        reason: formData.reason.trim()
      });

      showToast('✅ Mess cut application submitted successfully!', 'success');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit application';
      setError(errorMessage);
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Apply for Mess Cut</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-gray-900 mb-2">From Date</label>
            <input
              type="date"
              value={formData.from_date}
              onChange={(e) => handleInputChange('from_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-900 mb-2">To Date</label>
            <input
              type="date"
              value={formData.to_date}
              onChange={(e) => handleInputChange('to_date', e.target.value)}
              min={formData.from_date || new Date().toISOString().split('T')[0]}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-900 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter reason for mess cut..."
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentMessCuts;
