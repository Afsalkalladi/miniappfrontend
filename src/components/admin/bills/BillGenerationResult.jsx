import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '../../common/ui';

const BillGenerationResult = ({ result }) => {
  if (!result) return null;

  return (
    <Card variant="success" className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircleIcon className="w-6 h-6 text-green-400" />
        <h3 className="text-lg font-semibold text-green-400">Bills Generated Successfully!</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-green-300">Generated Bills</div>
          <div className="text-white font-bold text-lg">{result.generated_count}</div>
        </div>
        <div>
          <div className="text-green-300">Total Amount</div>
          <div className="text-white font-bold text-lg">₹{result.total_amount}</div>
        </div>
        <div>
          <div className="text-green-300">Average Bill</div>
          <div className="text-white font-bold text-lg">
            ₹{(result.total_amount / result.generated_count).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-green-300">Status</div>
          <div className="text-white font-bold text-lg">
            {result.published ? 'Published' : 'Draft'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BillGenerationResult;
