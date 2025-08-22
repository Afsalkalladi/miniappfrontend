import React from 'react';
import { Card } from '../../common/ui';

const InstructionsCard = () => {
  return (
    <Card variant="primary" className="bg-blue-500/20 border-blue-500">
      <h4 className="text-blue-400 font-medium mb-2">📱 How to Use</h4>
      <ul className="text-blue-300 text-sm space-y-1">
        <li>• Tap "QR Scanner" to start scanning student QR codes</li>
        <li>• Student information will appear with mess cut status</li>
        <li>• Students on mess cut will be blocked from entry</li>
        <li>• Mark attendance for eligible students</li>
        <li>• View payment status and student details</li>
      </ul>
    </Card>
  );
};

export default InstructionsCard;
