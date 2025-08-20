import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon, 
  PlusIcon, 
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentMessCuts = ({ onBack }) => {
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

      const response = await apiService.messCuts.getMyMessCuts();
      setMessCuts(response.data.mess_cuts || []);
    } catch (error) {
      console.error('Failed to load mess cuts:', error);
      setError('Failed to load mess cuts');
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
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Error Loading Mess Cuts</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadMessCuts} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-telegram-text">Mess Cuts</h1>
            <p className="text-telegram-hint">Apply for mess leave</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 bg-telegram-accent text-white px-4 py-2 rounded-lg hover:bg-telegram-accent/80"
        >
          <PlusIcon className="w-5 h-5" />
          Apply
        </button>
      </div>

      {/* Mess Cuts List */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">My Mess Cut Applications</h3>
        
        {messCuts.length > 0 ? (
          <div className="space-y-4">
            {messCuts.map((cut) => (
              <div key={cut.id} className="p-4 bg-telegram-bg rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-telegram-hint" />
                    <span className="text-telegram-text font-medium">
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
                    <span className="text-telegram-hint">Duration</span>
                    <span className="text-telegram-text">
                      {calculateDays(cut.from_date, cut.to_date)} day{calculateDays(cut.from_date, cut.to_date) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-telegram-hint">Applied</span>
                    <span className="text-telegram-text">
                      {new Date(cut.applied_at).toLocaleDateString()}
                    </span>
                  </div>

                  {cut.processed_at && (
                    <div className="flex justify-between">
                      <span className="text-telegram-hint">Processed</span>
                      <span className="text-telegram-text">
                        {new Date(cut.processed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-600">
                  <div className="text-telegram-hint text-sm mb-1">Reason:</div>
                  <div className="text-telegram-text text-sm">{cut.reason}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDaysIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Mess Cut Applications</h4>
            <p className="text-telegram-hint mb-4">You haven't applied for any mess cuts yet.</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn-primary"
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
        />
      )}
    </div>
  );
};

// Apply Mess Cut Modal Component
const ApplyMessCutModal = ({ onClose, onSuccess }) => {
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

      alert('✅ Mess cut application submitted successfully!');
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit application');
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
      <div className="bg-telegram-secondary rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Apply for Mess Cut</h3>
          <button onClick={onClose} className="text-telegram-hint hover:text-telegram-text">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-telegram-text mb-2">From Date</label>
            <input
              type="date"
              value={formData.from_date}
              onChange={(e) => handleInputChange('from_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
              required
            />
          </div>

          <div>
            <label className="block text-telegram-text mb-2">To Date</label>
            <input
              type="date"
              value={formData.to_date}
              onChange={(e) => handleInputChange('to_date', e.target.value)}
              min={formData.from_date || new Date().toISOString().split('T')[0]}
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
              required
            />
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Enter reason for mess cut..."
              rows={3}
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint resize-none"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
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
