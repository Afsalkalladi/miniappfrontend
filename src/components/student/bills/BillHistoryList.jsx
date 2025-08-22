import React from 'react';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { Card } from '../../common/ui';
import BillCard from './BillCard';

const BillHistoryList = ({ bills, onPayUPI, onPayOther }) => {
  return (
    <Card>
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text">Bill History</h3>
      </div>
      
      {bills.length > 0 ? (
        <div className="p-4 space-y-4">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPayUPI={onPayUPI}
              onPayOther={onPayOther}
              showBreakdown={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CurrencyRupeeIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
          <h4 className="text-telegram-text font-medium mb-2">No Bills Found</h4>
          <p className="text-telegram-hint">Your bills will appear here once generated.</p>
        </div>
      )}
    </Card>
  );
};

export default BillHistoryList;
