import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const PaymentModal = ({ bill, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionNumber.trim()) {
      setError('Transaction number is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await apiService.bills.submitPayment(bill.id, {
        payment_method: paymentMethod,
        transaction_number: transactionNumber.trim(),
      });

      // Haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit payment');
      
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
          <h3 className="text-lg font-semibold text-telegram-text">Submit Payment</h3>
          <button
            onClick={onClose}
            className="text-telegram-hint hover:text-telegram-text"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-telegram-text mb-2">Bill Amount</label>
            <div className="text-2xl font-bold text-telegram-accent">
              ₹{bill.amount}
            </div>
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
            >
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Transaction Number</label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="Enter transaction/reference number"
              className="input"
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
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
