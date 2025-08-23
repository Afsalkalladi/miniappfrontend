import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const PendingStudentsList = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getPendingStudents();
      setPendingStudents(response.pending_students || []);
    } catch (error) {
      console.error('Error fetching pending students:', error);
      setPendingStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [studentId]: 'approving' }));
      await apiService.admin.approveStudent(studentId);
      
      // Remove from pending list
      setPendingStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error approving student:', error);
      alert('Failed to approve student. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: null }));
    }
  };

  const handleReject = async (studentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [studentId]: 'rejecting' }));
      await apiService.admin.rejectStudent(studentId);
      
      // Remove from pending list
      setPendingStudents(prev => prev.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error rejecting student:', error);
      alert('Failed to reject student. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pending students...</span>
      </div>
    );
  }

  if (pendingStudents.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
        <p className="text-gray-600">No pending student approvals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Approvals ({pendingStudents.length})
        </h3>
      </div>

      <div className="space-y-3">
        {pendingStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{student.name}</h4>
                  <p className="text-sm text-gray-600">
                    Mess No: {student.mess_no || 'Not assigned'}
                  </p>
                  {student.department && (
                    <p className="text-sm text-gray-500">{student.department}</p>
                  )}
                  {student.telegram_username && (
                    <p className="text-sm text-blue-600">@{student.telegram_username}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(student.id)}
                  disabled={actionLoading[student.id]}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading[student.id] === 'approving' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Approve</span>
                </button>

                <button
                  onClick={() => handleReject(student.id)}
                  disabled={actionLoading[student.id]}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading[student.id] === 'rejecting' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <XCircleIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingStudentsList;
