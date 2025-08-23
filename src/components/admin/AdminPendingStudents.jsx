import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CalendarIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const AdminPendingStudents = ({ onBack }) => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total_count: 0 });
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    loadPendingStudents();
  }, []);

  const loadPendingStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.admin.getAllStudents({
        status: 'pending',
        limit: 100
      });
      
      const students = response.data.results || response.data || [];
      setPendingStudents(students);
      setStats({
        total_count: students.length
      });
    } catch (error) {
      console.error('Failed to load pending students:', error);
      setError('Failed to load pending students');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId, studentName) => {
    try {
      if (!confirm(`Approve student ${studentName}?`)) {
        return;
      }

      setProcessingIds(prev => new Set([...prev, studentId]));
      
      await apiService.admin.updateStudentStatus(studentId, 'approve');
      
      // Remove from pending list
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      setStats(prev => ({ ...prev, total_count: prev.total_count - 1 }));
      
      alert(`✅ ${studentName} has been approved!`);
    } catch (error) {
      console.error('Failed to approve student:', error);
      alert(`Failed to approve student: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const handleRejectStudent = async (studentId, studentName) => {
    try {
      if (!confirm(`Reject student ${studentName}? This action cannot be undone.`)) {
        return;
      }

      setProcessingIds(prev => new Set([...prev, studentId]));
      
      await apiService.admin.updateStudentStatus(studentId, 'reject');
      
      // Remove from pending list
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      setStats(prev => ({ ...prev, total_count: prev.total_count - 1 }));
      
      alert(`❌ ${studentName} has been rejected.`);
    } catch (error) {
      console.error('Failed to reject student:', error);
      alert(`Failed to reject student: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Error Loading Pending Students</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadPendingStudents} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-telegram-text">Pending Students</h1>
            <p className="text-telegram-hint">{stats.total_count} students awaiting approval</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.total_count}</div>
          <div className="text-yellow-300 text-sm">Pending Approvals</div>
        </div>
      </div>

      {/* Pending Students List */}
      <div className="bg-telegram-secondary rounded-lg border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Students Awaiting Approval</h3>
        </div>
        
        {pendingStudents.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {pendingStudents.map((student) => (
              <div key={student.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-telegram-text font-medium text-lg">{student.name}</h4>
                      <span className="px-2 py-1 bg-telegram-accent/20 text-telegram-accent rounded text-sm font-mono">
                        {student.mess_no}
                      </span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Department:</span>
                          <span className="text-telegram-text">{student.department || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Mobile:</span>
                          <span className="text-telegram-text">{student.mobile_number || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <HomeIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Room:</span>
                          <span className="text-telegram-text">{student.room_no || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Telegram ID:</span>
                          <span className="text-telegram-text font-mono">{student.user?.telegram_id || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Registered:</span>
                          <span className="text-telegram-text">
                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-telegram-hint" />
                          <span className="text-telegram-hint">Status:</span>
                          <span className="text-yellow-400">Awaiting Approval</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Days Pending */}
                <div className="mb-4">
                  {(() => {
                    const daysPending = student.created_at ? 
                      Math.floor((new Date() - new Date(student.created_at)) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                        daysPending > 7 ? 'bg-red-500/20 text-red-400' :
                        daysPending > 3 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {daysPending} days pending
                      </div>
                    );
                  })()}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => handleApproveStudent(student.id, student.name)}
                    disabled={processingIds.has(student.id)}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {processingIds.has(student.id) ? 'Approving...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleRejectStudent(student.id, student.name)}
                    disabled={processingIds.has(student.id)}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    {processingIds.has(student.id) ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Pending Students!</h4>
            <p className="text-telegram-hint">All student registrations have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingStudents;
