import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Card, Button } from '../../common/ui';

const RecentBillsList = ({ bills, onPublishBills }) => {
  const formatMonth = (monthString) => {
    return new Date(monthString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <Card>
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text">Recent Bill Generations</h3>
      </div>
      
      {bills.length > 0 ? (
        <div className="divide-y divide-gray-600">
          {bills.map((bill, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-telegram-text font-medium">
                    {formatMonth(bill.month)}
                  </h4>
                  <div className="text-telegram-hint text-sm">
                    {bill.total_bills} bills • ₹{bill.total_amount} total
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {bill.is_published ? (
                    <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">
                      Published
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onPublishBills(bill.month)}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
          <h4 className="text-telegram-text font-medium mb-2">No Bills Generated</h4>
          <p className="text-telegram-hint">Generate your first batch of bills above.</p>
        </div>
      )}
    </Card>
  );
};

export default RecentBillsList;
