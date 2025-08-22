import React from 'react';
import { CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { Card, Button } from '../../common/ui';
import BillCard from './BillCard';

const CurrentBillCard = ({ bill, onPayUPI, onPayOther }) => {
  if (!bill) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Current Bill</h3>
      <BillCard 
        bill={bill}
        onPayUPI={onPayUPI}
        onPayOther={onPayOther}
        showBreakdown={true}
      />
      
      {bill.status === 'payment_submitted' && (
        <div className="mt-4 p-3 bg-yellow-400/20 border border-yellow-400 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">
            ⏳ Payment submitted and under verification
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentBillCard;
