import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const MessCutModal = ({ onClose, onSuccess }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fromDate || !toDate || !reason.trim()) {
      setError('All fields are required');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be after to date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await apiService.messCuts.apply({
        from_date: fromDate,
        to_date: toDate,
        reason: reason.trim(),
      });

      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to apply for mess cut');
      
      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-telegram-secondary rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Apply for Mess Cut</h3>
          <button
            onClick={onClose}
            className="text-telegram-hint hover:text-telegram-text"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-telegram-text mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-telegram-text mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input"
              required
              min={fromDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for mess cut"
              className="input min-h-[80px] resize-none"
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
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessCutModal;
