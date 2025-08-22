import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Card, FormField, Input, Select, Button, Alert } from '../../common/ui';
import { apiService } from '../../../services/apiService';

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

      alert('✅ Payment submitted successfully! It will be verified by admin.');
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Submit Payment</h3>
          <button 
            onClick={onClose} 
            className="text-telegram-hint hover:text-telegram-text p-1 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-telegram-text mb-2 font-medium">Bill Amount</label>
            <div className="text-2xl font-bold text-telegram-accent">₹{bill.amount}</div>
          </div>

          <FormField label="Payment Method">
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </Select>
          </FormField>

          <FormField 
            label="Transaction ID / Reference Number" 
            required
            error={error}
          >
            <Input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="Enter UPI transaction ID, bank reference number, or receipt number"
              className="font-mono"
              required
              minLength={6}
            />
            <p className="text-telegram-hint text-xs mt-1">
              💡 Enter the transaction ID from your payment app or bank receipt
            </p>
          </FormField>

          {error && (
            <Alert type="error" message={error} />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Submit Payment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PaymentModal;
