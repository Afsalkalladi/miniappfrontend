import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { 
  BellIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiService.student.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.student.markNotificationRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      default: return <BellIcon className="w-5 h-5 text-telegram-hint" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-600 bg-telegram-secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-secondary h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">Notifications</h1>
        <p className="text-telegram-hint">Messages from admin and system updates</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`card border ${getNotificationColor(notification.type)} ${
              !notification.is_read ? 'ring-1 ring-telegram-accent' : ''
            }`}
            onClick={() => !notification.is_read && markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-telegram-text font-medium">
                    {notification.title}
                  </h3>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-telegram-accent rounded-full"></div>
                  )}
                </div>
                <p className="text-telegram-hint text-sm mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-telegram-hint text-xs">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {notification.is_read && (
                    <span className="text-green-400 text-xs">Read</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h3 className="text-telegram-text text-lg font-medium mb-2">No Notifications</h3>
            <p className="text-telegram-hint">You'll receive notifications here from admin.</p>
          </div>
        )}
      </div>

      {/* Mark All as Read */}
      {notifications.some(n => !n.is_read) && (
        <div className="fixed bottom-20 left-4 right-4">
          <button
            onClick={() => {
              notifications.forEach(n => {
                if (!n.is_read) markAsRead(n.id);
              });
            }}
            className="w-full btn-primary"
          >
            Mark All as Read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
