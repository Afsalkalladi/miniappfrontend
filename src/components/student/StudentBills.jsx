import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentBills = ({ user, showToast }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentQR, setPaymentQR] = useState(null);
  const [transactionNumber, setTransactionNumber] = useState('');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.students.getBills();
      const billsData = Array.isArray(response) ? response : (response?.bills || response?.data || []);
      setBills(billsData);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setError('Failed to load bills');
      showToast('Failed to load bills', 'error');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (bill) => {
    try {
      setLoading(true);
      const qrResponse = await apiService.students.getPaymentQR(bill.id);
      setPaymentQR(qrResponse.data?.qr_code || qrResponse.qr_code);
      setSelectedBill(bill);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Failed to generate payment QR:', error);
      showToast?.('Failed to generate payment QR', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!transactionNumber.trim()) {
      showToast?.('Please enter transaction number', 'error');
      return;
    }

    try {
      setLoading(true);
      await apiService.students.submitPayment(selectedBill.id, transactionNumber);
      showToast?.('Payment submitted successfully! It will be verified shortly.', 'success');
      setShowPaymentModal(false);
      setTransactionNumber('');
      setPaymentQR(null);
      loadBills();
    } catch (error) {
      console.error('Failed to submit payment:', error);
      showToast?.(error.message || 'Failed to submit payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner text="Loading bills..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-600 font-medium mb-2">Error Loading Bills</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button 
            onClick={loadBills} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pendingBills = bills.filter(bill => bill.status === 'pending' || bill.status === 'unpaid');
  const paidBills = bills.filter(bill => bill.status === 'paid');

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'unpaid': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
          <p className="text-gray-600 mt-2">View and pay your mess bills</p>
        </div>

        {/* Pending Bills */}
        {pendingBills.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-red-50">
              <h3 className="text-lg font-semibold text-red-800">Pending Dues</h3>
              <p className="text-red-600 text-sm">Pay now to avoid late fees</p>
            </div>
            <div className="divide-y">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {bill.month ? new Date(bill.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : `Bill #${bill.id}`}
                      </h3>
                      <p className="text-sm text-gray-600">Mess No: {bill.mess_no}</p>
                      {bill.due_date && (
                        <p className="text-xs text-red-600">Due: {new Date(bill.due_date).toLocaleDateString('en-IN')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{bill.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : bill.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status === 'paid' ? 'Paid' : bill.status === 'pending' ? 'Pending' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePayBill(bill)}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bill History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          </div>
          
          {paidBills.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payment history yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {paidBills.map((bill) => (
                <div key={bill.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {bill.month || new Date(bill.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <p className="text-sm text-gray-600">Bill #{bill.id}</p>
                      <p className="text-sm text-gray-500">
                        Paid on: {new Date(bill.paid_at || bill.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₹{bill.total_amount || bill.amount || 0}</p>
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pay Bill</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentQR(null);
                    setTransactionNumber('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Bill Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Bill Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Month:</span>
                    <span>{selectedBill.month ? new Date(selectedBill.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Current'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mess No:</span>
                    <span>{selectedBill.student?.mess_no || selectedBill.mess_no || user?.mess_no || 'N/A'}</span>
                  </div>
                  {selectedBill.due_date && (
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="text-red-600 font-medium">{new Date(selectedBill.due_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>₹{selectedBill.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Payment QR Code */}
              {paymentQR && (
                <div className="bg-blue-50 rounded-lg p-4 text-center mb-4">
                  <h4 className="font-medium text-blue-800 mb-3">Scan to Pay</h4>
                  <img 
                    src={paymentQR} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 mx-auto mb-3 border-2 border-white rounded-lg shadow-sm"
                  />
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Mess No:</strong> {selectedBill.student?.mess_no || selectedBill.mess_no || user?.mess_no || 'N/A'}</p>
                    <p><strong>Amount:</strong> ₹{selectedBill.total_amount || selectedBill.amount}</p>
                    <p className="text-xs text-blue-600 mt-2">Scan this QR code with any UPI app to pay</p>
                  </div>
                </div>
              )}

              {/* Transaction Number Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Number *
                  </label>
                  <input
                    type="text"
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter UPI transaction ID"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the transaction ID from your payment app
                  </p>
                </div>

                <button
                  onClick={handleSubmitPayment}
                  disabled={loading || !transactionNumber.trim()}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> After submitting, your payment will be verified by admin. 
                  You'll be notified once verified.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentBills;
