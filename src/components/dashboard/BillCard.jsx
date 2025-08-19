import React from 'react';
import { format } from 'date-fns';
import { CurrencyRupeeIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const BillCard = ({ bill }) => {
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
      case 'paid': return <CheckCircleIcon className="w-5 h-5" />;
      case 'payment_submitted': return <ClockIcon className="w-5 h-5" />;
      default: return <CurrencyRupeeIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-telegram-text">Current Bill</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
          {getStatusIcon(bill.status)}
          {bill.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-telegram-hint">Month</span>
          <div className="flex items-center gap-2 text-telegram-text">
            <CalendarIcon className="w-4 h-4" />
            {format(new Date(bill.month), 'MMMM yyyy')}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-telegram-hint">Amount</span>
          <div className="flex items-center gap-2 text-telegram-text font-semibold text-lg">
            <CurrencyRupeeIcon className="w-5 h-5" />
            {bill.amount}
          </div>
        </div>

        {bill.breakdown && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-medium text-telegram-text mb-2">Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-telegram-hint">Billable Days</span>
                <span className="text-telegram-text">{bill.breakdown.billable_days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-telegram-hint">Per Day Charge</span>
                <span className="text-telegram-text">₹{bill.breakdown.per_day_charge}</span>
              </div>
              {bill.breakdown.establishment_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-telegram-hint">Establishment</span>
                  <span className="text-telegram-text">₹{bill.breakdown.establishment_charge}</span>
                </div>
              )}
              {bill.breakdown.valid_mess_cuts > 0 && (
                <div className="flex justify-between">
                  <span className="text-telegram-hint">Mess Cuts</span>
                  <span className="text-green-400">-{bill.breakdown.valid_mess_cuts} days</span>
                </div>
              )}
            </div>
          </div>
        )}

        {bill.status === 'pending' && (
          <button className="w-full btn-primary mt-4">
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
};

export default BillCard;
