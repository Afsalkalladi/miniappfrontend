import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  SpeakerWaveIcon,
  UserIcon,
  UsersIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminNotifications = ({ user, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);

  const [bulkForm, setBulkForm] = useState({
    title: '',
    message: '',
    target_group: 'all_students'
  });

  const [individualForm, setIndividualForm] = useState({
    student_id: '',
    title: '',
    message: ''
  });

  const handleBulkNotification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.notifications.sendBulk(bulkForm);
      showToast('Bulk notification sent successfully!', 'success');
      setShowBulkForm(false);
      setBulkForm({
        title: '',
        message: '',
        target_group: 'all_students'
      });
    } catch (error) {
      console.error('Failed to send bulk notification:', error);
      showToast(error.response?.data?.error || 'Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualNotification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.notifications.sendIndividual(individualForm);
      showToast('Individual notification sent successfully!', 'success');
      setShowIndividualForm(false);
      setIndividualForm({
        student_id: '',
        title: '',
        message: ''
      });
    } catch (error) {
      console.error('Failed to send individual notification:', error);
      showToast(error.response?.data?.error || 'Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickNotifications = [
    {
      title: 'Mess Bill Generated',
      message: 'Your monthly mess bill has been generated. Please check and pay your dues.',
      target: 'all_students'
    },
    {
      title: 'Payment Reminder',
      message: 'This is a reminder to pay your pending mess bill dues.',
      target: 'unpaid_students'
    },
    {
      title: 'Mess Cut Reminder',
      message: 'Remember to apply for mess cuts before 9 PM if you plan to be away.',
      target: 'all_students'
    },
    {
      title: 'System Maintenance',
      message: 'The mess management system will be under maintenance tonight from 11 PM to 1 AM.',
      target: 'all_students'
    }
  ];

  const sendQuickNotification = async (notification) => {
    try {
      setLoading(true);
      await apiService.notifications.sendBulk({
        title: notification.title,
        message: notification.message,
        target_group: notification.target
      });
      showToast(`"${notification.title}" sent successfully!`, 'success');
    } catch (error) {
      console.error('Failed to send quick notification:', error);
      showToast('Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Send Notifications</h2>
        <p className="text-gray-600 mt-1">Communicate with students</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setShowBulkForm(true)}
          className="bg-blue-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <UsersIcon className="w-5 h-5" />
          Send Bulk Notification
        </button>

        <button
          onClick={() => setShowIndividualForm(true)}
          className="bg-green-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
        >
          <UserIcon className="w-5 h-5" />
          Send Individual Notification
        </button>
      </div>

      {/* Quick Notification Templates */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <SpeakerWaveIcon className="w-5 h-5" />
          Quick Templates
        </h3>
        <div className="space-y-3">
          {quickNotifications.map((notification, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Target: {notification.target === 'all_students' ? 'All Students' : 'Unpaid Students'}
                  </p>
                </div>
                <button
                  onClick={() => sendQuickNotification(notification)}
                  disabled={loading}
                  className="ml-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner text="Sending notification..." />
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Bulk Notification</h3>
              <button
                onClick={() => setShowBulkForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBulkNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Group
                </label>
                <select
                  value={bulkForm.target_group}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, target_group: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="all_students">All Students</option>
                  <option value="unpaid_students">Students with Unpaid Bills</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mess Bill Generated"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={bulkForm.message}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Notification Modal */}
      {showIndividualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Individual Notification</h3>
              <button
                onClick={() => setShowIndividualForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleIndividualNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="number"
                  value={individualForm.student_id}
                  onChange={(e) => setIndividualForm(prev => ({ ...prev, student_id: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={individualForm.title}
                  onChange={(e) => setIndividualForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Payment Reminder"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={individualForm.message}
                  onChange={(e) => setIndividualForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIndividualForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
