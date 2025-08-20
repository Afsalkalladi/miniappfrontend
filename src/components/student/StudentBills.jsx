import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentBills = ({ onBack }) => {
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current bill and all bills
      const [currentResponse, allResponse] = await Promise.all([
        apiService.bills.getCurrentBill().catch(() => ({ data: null })),
        apiService.bills.getAllBills().catch(() => ({ data: { bills: [] } }))
      ]);

      setCurrentBill(currentResponse.data);
      setBills(allResponse.data.bills || []);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/20';
      case 'payment_submitted': return 'text-yellow-400 bg-yellow-400/20';
      case 'pending': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="w-4 h-4" />;
      case 'payment_submitted': return <ClockIcon className="w-4 h-4" />;
      default: return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
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
            <h3 className="text-red-400 font-medium mb-2">Error Loading Bills</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadBills} className="btn-primary">
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
        >
          <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">My Bills</h1>
          <p className="text-telegram-hint">View and manage your mess bills</p>
        </div>
      </div>

      {/* Current Bill */}
      {currentBill && (
        <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-telegram-text">Current Bill</h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentBill.status)}`}>
              {getStatusIcon(currentBill.status)}
              {currentBill.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-telegram-hint">Month</span>
              <div className="flex items-center gap-2 text-telegram-text">
                <CalendarIcon className="w-4 h-4" />
                {new Date(currentBill.month).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-telegram-hint">Amount</span>
              <div className="flex items-center gap-2 text-telegram-text font-semibold text-lg">
                <CurrencyRupeeIcon className="w-5 h-5" />
                {currentBill.amount}
              </div>
            </div>

            {currentBill.breakdown && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h4 className="text-sm font-medium text-telegram-text mb-2">Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-telegram-hint">Billable Days</span>
                    <span className="text-telegram-text">{currentBill.breakdown.billable_days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-telegram-hint">Per Day Charge</span>
                    <span className="text-telegram-text">₹{currentBill.breakdown.per_day_charge}</span>
                  </div>
                  {currentBill.breakdown.establishment_charge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-telegram-hint">Establishment</span>
                      <span className="text-telegram-text">₹{currentBill.breakdown.establishment_charge}</span>
                    </div>
                  )}
                  {currentBill.breakdown.valid_mess_cuts > 0 && (
                    <div className="flex justify-between">
                      <span className="text-telegram-hint">Mess Cuts</span>
                      <span className="text-green-400">-{currentBill.breakdown.valid_mess_cuts} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(currentBill.status === 'pending' || currentBill.status === 'unpaid') && (
              <button
                onClick={() => handlePayBill(currentBill)}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mt-4 flex items-center justify-center gap-2"
              >
                <CurrencyRupeeIcon className="w-5 h-5" />
                Pay Now - ₹{currentBill.amount}
              </button>
            )}

            {currentBill.status === 'payment_submitted' && (
              <div className="mt-4 p-3 bg-yellow-400/20 border border-yellow-400 rounded-lg">
                <p className="text-yellow-400 text-sm text-center">
                  ⏳ Payment submitted and under verification
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Bills */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Bill History</h3>
        
        {bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="p-4 bg-telegram-bg rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-telegram-hint" />
                    <span className="text-telegram-text font-medium">
                      {new Date(bill.month).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                    {bill.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-5 h-5 text-telegram-hint" />
                    <span className="text-telegram-text text-lg font-semibold">
                      ₹{bill.amount}
                    </span>
                  </div>
                  {bill.paid_at && (
                    <span className="text-telegram-hint text-sm">
                      Paid: {new Date(bill.paid_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {(bill.status === 'pending' || bill.status === 'unpaid') && (
                  <button
                    onClick={() => handlePayBill(bill)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    Pay Now - ₹{bill.amount}
                  </button>
                )}

                {bill.status === 'payment_submitted' && (
                  <div className="p-2 bg-yellow-400/20 border border-yellow-400 rounded-lg">
                    <p className="text-yellow-400 text-xs text-center">
                      Payment under verification
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CurrencyRupeeIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Bills Found</h4>
            <p className="text-telegram-hint">Your bills will appear here once generated.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            loadBills();
          }}
        />
      )}
    </div>
  );
};

// Simple Payment Modal Component
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
      <div className="bg-telegram-secondary rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Submit Payment</h3>
          <button onClick={onClose} className="text-telegram-hint hover:text-telegram-text">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-telegram-text mb-2">Bill Amount</label>
            <div className="text-2xl font-bold text-telegram-accent">₹{bill.amount}</div>
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            >
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-telegram-text mb-2">Transaction ID / Reference Number *</label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
              placeholder="Enter UPI transaction ID, bank reference number, or receipt number"
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text placeholder-telegram-hint font-mono"
              required
              minLength={6}
            />
            <p className="text-telegram-hint text-xs mt-1">
              💡 Enter the transaction ID from your payment app or bank receipt
            </p>
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

export default StudentBills;
