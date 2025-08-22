import React from 'react';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../common/ui';

const QuickActions = ({ onScannerClick }) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <Button
        onClick={onScannerClick}
        variant="primary"
        className="p-6 h-auto"
      >
        <div className="flex items-center justify-center gap-3">
          <QrCodeIcon className="w-8 h-8" />
          <div className="text-left">
            <h3 className="font-semibold text-lg">QR Scanner</h3>
            <p className="text-sm opacity-90">Scan student QR codes for attendance</p>
          </div>
        </div>
      </Button>
    </div>
  );
};

export default QuickActions;
