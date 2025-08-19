import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockActivities = [
        {
          id: 1,
          type: 'attendance',
          title: 'Lunch attendance marked',
          time: new Date(),
          status: 'success'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Payment submitted for November',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: 3,
          type: 'mess_cut',
          title: 'Mess cut applied for weekend',
          time: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'success'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type, status) => {
    if (status === 'success') return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    if (status === 'error') return <XCircleIcon className="w-5 h-5 text-red-400" />;
    return <ClockIcon className="w-5 h-5 text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-bg h-12 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-telegram-bg rounded-lg">
              {getActivityIcon(activity.type, activity.status)}
              <div className="flex-1">
                <p className="text-telegram-text text-sm font-medium">{activity.title}</p>
                <p className="text-telegram-hint text-xs">
                  {format(activity.time, 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <ClockIcon className="w-12 h-12 text-telegram-hint mx-auto mb-2" />
          <p className="text-telegram-hint">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
