import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiService } from '../../services/apiService';
import { CurrencyRupeeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await apiService.bills.getAllBills();
      setBills(response.data.bills || []);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setBills([]);
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

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-secondary h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">My Bills</h1>
        <p className="text-telegram-hint">View and manage your mess bills</p>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-telegram-hint" />
                <span className="text-telegram-text font-medium">
                  {format(new Date(bill.month), 'MMMM yyyy')}
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
                  {bill.amount}
                </span>
              </div>
              {bill.paid_at && (
                <span className="text-telegram-hint text-sm">
                  Paid: {format(new Date(bill.paid_at), 'dd MMM yyyy')}
                </span>
              )}
            </div>

            {bill.status === 'pending' && (
              <button
                onClick={() => handlePayBill(bill)}
                className="w-full btn-primary"
              >
                Pay Now
              </button>
            )}
          </div>
        ))}

        {bills.length === 0 && (
          <div className="text-center py-12">
            <CurrencyRupeeIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h3 className="text-telegram-text text-lg font-medium mb-2">No Bills Found</h3>
            <p className="text-telegram-hint">Your bills will appear here once generated.</p>
          </div>
        )}
      </div>

      {showPaymentModal && (
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

export default Bills;
