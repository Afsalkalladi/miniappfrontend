import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const AdminPaymentVerification = ({ onBack }) => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.admin.getPaymentVerifications();
      setPendingPayments(response.data.pending_payments || []);
    } catch (error) {
      console.error('Failed to load pending payments:', error);
      setError('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (billId, action) => {
    try {
      const payment = pendingPayments.find(p => p.id === billId);
      const actionText = action === 'approve' ? 'approve' : 'reject';
      
      if (!confirm(`${actionText.toUpperCase()} payment for ${payment?.student_name}?\n\nTransaction: ${payment?.transaction_number}\nAmount: ₹${payment?.amount}`)) {
        return;
      }

      await apiService.admin.verifyPayment(billId, { action });
      
      if (action === 'approve') {
        alert(`✅ Payment approved for ${payment?.student_name}!`);
      } else {
        alert(`❌ Payment rejected for ${payment?.student_name}!`);
      }
      
      loadPendingPayments();
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert(`Failed to ${action} payment: ${error.response?.data?.error || error.message}`);
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
            <h3 className="text-red-400 font-medium mb-2">Error Loading Payments</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadPendingPayments} className="btn-primary">
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
          <h1 className="text-2xl font-bold text-telegram-text">Payment Verification</h1>
          <p className="text-telegram-hint">Verify submitted payments ({pendingPayments.length} pending)</p>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-telegram-secondary rounded-lg border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Payments Awaiting Verification</h3>
        </div>
        
        {pendingPayments.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-telegram-text font-medium text-lg">{payment.student_name}</h4>
                      <span className="px-2 py-1 bg-telegram-accent/20 text-telegram-accent rounded text-sm font-mono">
                        {payment.mess_no}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Month:</span>
                          <span className="text-telegram-text">
                            {new Date(payment.month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CurrencyRupeeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Amount:</span>
                          <span className="text-telegram-text font-semibold">₹{payment.amount}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Mobile:</span>
                          <span className="text-telegram-text">{payment.student?.mobile_number || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-telegram-hint">Payment Method:</span>
                          <span className="text-telegram-text ml-2 capitalize">{payment.payment_method}</span>
                        </div>
                        
                        <div>
                          <span className="text-telegram-hint">Transaction ID:</span>
                          <span className="text-telegram-text ml-2 font-mono bg-telegram-bg px-2 py-1 rounded">
                            {payment.transaction_number}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-telegram-hint">Submitted:</span>
                          <span className="text-telegram-text ml-2">
                            {new Date(payment.submitted_at).toLocaleDateString()} at{' '}
                            {new Date(payment.submitted_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-telegram-hint">Department:</span>
                          <span className="text-telegram-text ml-2">{payment.student?.department || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => handleVerifyPayment(payment.id, 'approve')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve Payment
                  </button>
                  
                  <button
                    onClick={() => handleVerifyPayment(payment.id, 'reject')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">All Payments Verified</h4>
            <p className="text-telegram-hint">No payments pending verification at the moment.</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mt-6">
        <h4 className="text-blue-400 font-medium mb-2">💡 Verification Guidelines</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Verify transaction ID with your payment gateway/bank records</li>
          <li>• Check if the amount matches the bill amount exactly</li>
          <li>• Contact student if transaction details seem suspicious</li>
          <li>• Approved payments will mark the bill as paid automatically</li>
          <li>• Rejected payments will notify the student to resubmit</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPaymentVerification;
