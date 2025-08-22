import React from 'react';
import { 
  CalendarIcon, 
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Card, Button } from '../../common/ui';

const BillCard = ({ bill, onPayUPI, onPayOther, showBreakdown = false }) => {
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

  const formatMonth = (monthString) => {
    return new Date(monthString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const isPending = bill.status === 'pending' || bill.status === 'unpaid';
  const isSubmitted = bill.status === 'payment_submitted';

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-telegram-hint" />
          <span className="text-telegram-text font-medium">
            {formatMonth(bill.month)}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
          {getStatusIcon(bill.status)}
          {bill.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between">
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

      {/* Breakdown */}
      {showBreakdown && bill.breakdown && (
        <div className="pt-4 border-t border-gray-600">
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

      {/* Payment Actions */}
      {isPending && (
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={() => onPayUPI(bill)}
          >
            <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
              <span className="text-blue-500 text-xs font-bold">₹</span>
            </div>
            UPI Pay - ₹{bill.amount}
          </Button>

          <Button
            variant="success"
            className="w-full"
            onClick={() => onPayOther(bill)}
          >
            <CurrencyRupeeIcon className="w-4 h-4" />
            Other Methods
          </Button>
        </div>
      )}

      {/* Payment Status */}
      {isSubmitted && (
        <div className="p-2 bg-yellow-400/20 border border-yellow-400 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            ⏳ Payment under verification
          </p>
        </div>
      )}
    </Card>
  );
};

export default BillCard;
