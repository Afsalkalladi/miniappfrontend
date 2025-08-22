import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '../../common/ui';

const RecentScansCard = ({ recentScans }) => {
  if (!recentScans || recentScans.length === 0) return null;

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Recent Scans</h3>
      
      <div className="space-y-3">
        {recentScans.slice(0, 5).map((scan, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-telegram-bg rounded">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-telegram-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {scan.student_name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <div className="text-telegram-text font-medium text-sm">
                  {scan.student_name}
                </div>
                <div className="text-telegram-hint text-xs">
                  {scan.mess_no} • {scan.meal_type}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-telegram-text text-sm">
                {new Date(scan.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs">Marked</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentScansCard;
