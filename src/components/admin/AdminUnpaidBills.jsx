import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  CalendarIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const AdminUnpaidBills = ({ onBack }) => {
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total_count: 0, total_amount: 0 });

  useEffect(() => {
    loadUnpaidBills();
  }, []);

  const loadUnpaidBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.admin.getUnpaidBills();
      setUnpaidBills(response.data.unpaid_bills || []);
      setStats({
        total_count: response.data.total_count || 0,
        total_amount: response.data.total_amount || 0
      });
    } catch (error) {
      console.error('Failed to load unpaid bills:', error);
      setError('Failed to load unpaid bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (billId) => {
    try {
      const bill = unpaidBills.find(b => b.id === billId);
      if (!confirm(`Send payment reminder to ${bill?.student_name}?`)) {
        return;
      }

      await apiService.notifications.sendToStudent(bill.student?.id, {
        title: 'Payment Reminder',
        message: `Your mess bill for ${new Date(bill.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} of ₹${bill.amount} is still pending. Please pay at your earliest convenience.`,
        type: 'PAYMENT_REMINDER'
      });

      alert(`✅ Payment reminder sent to ${bill?.student_name}!`);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert(`Failed to send reminder: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSendBulkReminder = async () => {
    try {
      if (!confirm(`Send payment reminders to all ${unpaidBills.length} students with unpaid bills?`)) {
        return;
      }

      await apiService.notifications.sendToAll({
        title: 'Payment Reminder',
        message: 'This is a reminder that you have unpaid mess bills. Please check your bills and make payment at your earliest convenience.',
        type: 'BULK_PAYMENT_REMINDER'
      });

      alert(`✅ Payment reminders sent to all students with unpaid bills!`);
    } catch (error) {
      console.error('Failed to send bulk reminder:', error);
      alert(`Failed to send bulk reminder: ${error.response?.data?.error || error.message}`);
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
            <h3 className="text-red-400 font-medium mb-2">Error Loading Unpaid Bills</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadUnpaidBills} className="btn-primary">
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
            <h1 className="text-2xl font-bold text-telegram-text">Unpaid Bills</h1>
            <p className="text-telegram-hint">{stats.total_count} students • ₹{stats.total_amount} total</p>
          </div>
        </div>
        
        {unpaidBills.length > 0 && (
          <button
            onClick={handleSendBulkReminder}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            <BellIcon className="w-5 h-5" />
            Send Bulk Reminder
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.total_count}</div>
          <div className="text-red-300 text-sm">Unpaid Bills</div>
        </div>
        
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">₹{stats.total_amount}</div>
          <div className="text-red-300 text-sm">Outstanding Amount</div>
        </div>
      </div>

      {/* Unpaid Bills List */}
      <div className="bg-telegram-secondary rounded-lg border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Students with Unpaid Bills</h3>
        </div>
        
        {unpaidBills.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {unpaidBills.map((bill) => (
              <div key={bill.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-telegram-text font-medium text-lg">{bill.student_name}</h4>
                      <span className="px-2 py-1 bg-telegram-accent/20 text-telegram-accent rounded text-sm font-mono">
                        {bill.mess_no}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Month:</span>
                          <span className="text-telegram-text">
                            {new Date(bill.month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CurrencyRupeeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Amount:</span>
                          <span className="text-telegram-text font-semibold text-red-400">₹{bill.amount}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Generated:</span>
                          <span className="text-telegram-text">
                            {new Date(bill.generated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Department:</span>
                          <span className="text-telegram-text">{bill.student?.department || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Mobile:</span>
                          <span className="text-telegram-text">{bill.student?.mobile_number || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <HomeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Room:</span>
                          <span className="text-telegram-text">{bill.student?.room_no || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Days Overdue */}
                <div className="mb-4">
                  {(() => {
                    const daysOverdue = Math.floor((new Date() - new Date(bill.generated_at)) / (1000 * 60 * 60 * 24));
                    return (
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                        daysOverdue > 30 ? 'bg-red-500/20 text-red-400' :
                        daysOverdue > 15 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {daysOverdue} days overdue
                      </div>
                    );
                  })()}
                </div>
                
                {/* Action Button */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => handleSendReminder(bill.id)}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <BellIcon className="w-4 h-4" />
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CurrencyRupeeIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">All Bills Paid!</h4>
            <p className="text-telegram-hint">No unpaid bills at the moment. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUnpaidBills;
