import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import {
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load admin dashboard stats and pending approvals
      const [statsResponse, studentsResponse] = await Promise.all([
        apiService.admin.getDashboardStats().catch(() => ({ data: null })),
        apiService.admin.getPendingStudents().catch(() => ({ data: [] }))
      ]);
      
      setStats(statsResponse.data);
      setPendingStudents(studentsResponse.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentApproval = async (studentId, action) => {
    try {
      if (action === 'approve') {
        await apiService.admin.approveStudent(studentId);
      } else if (action === 'reject') {
        await apiService.admin.rejectStudent(studentId);
      }

      // Remove from pending list
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));

      // Reload stats to update counts
      loadAdminData();

      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      // Show success message
      alert(`Student ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);

    } catch (error) {
      console.error('Failed to process student approval:', error);

      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }

      // Show error message
      alert(`Failed to ${action} student: ${error.response?.data?.error || error.message}`);
    }
  };

  // Admin action handlers
  const handleGenerateBills = () => {
    alert('Generate Bills feature will be available soon. This will create monthly bills for all active students.');
  };

  const handleUnpaidStudents = () => {
    alert('Unpaid Students report will show all students with pending payments.');
  };

  const handleAllStudents = () => {
    alert('All Students view will show complete student database with search and filter options.');
  };

  const handleAddStudent = () => {
    alert('Add Student feature will allow manual student registration by admin.');
  };

  const handleModifyStudent = () => {
    alert('Modify Student feature will allow editing student information.');
  };

  const handleDeleteStudent = () => {
    alert('Delete Student feature will allow removing students from the system.');
  };

  const handleSendNotificationAll = () => {
    alert('Send Notification to All will broadcast messages to all students via Telegram.');
  };

  const handleSendNotificationSpecific = () => {
    alert('Send to Specific Students will allow targeted messaging.');
  };

  const handleAttendanceReport = () => {
    alert('Attendance Report will show detailed attendance analytics.');
  };

  const handleRevenueReport = () => {
    alert('Revenue Report will show financial analytics and payment statistics.');
  };

  // This component is only rendered for admin role users, so no access check needed

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-secondary h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">Admin Panel</h1>
          <p className="text-telegram-hint">Manage students, bills, and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-telegram-text font-medium">Admin User</p>
            <p className="text-blue-400 text-sm">Admin Panel</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.reload();
            }}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <UsersIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.total_students || 0}</div>
            <div className="text-telegram-hint text-sm">Total Students</div>
          </div>
          
          <div className="card text-center">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.approved_students || 0}</div>
            <div className="text-telegram-hint text-sm">Approved</div>
          </div>
          
          <div className="card text-center">
            <CurrencyRupeeIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">₹{stats.total_revenue || 0}</div>
            <div className="text-telegram-hint text-sm">Total Revenue</div>
          </div>
          
          <div className="card text-center">
            <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.today_attendance || 0}</div>
            <div className="text-telegram-hint text-sm">Today's Attendance</div>
          </div>
        </div>
      )}

      {/* Pending Student Approvals */}
      <div className="card">
        <h3 className="text-lg font-semibold text-telegram-text mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Student Verification ({pendingStudents.length})
        </h3>

        {pendingStudents.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pendingStudents.map((student) => (
              <div key={student.id} className="p-4 bg-telegram-bg rounded-lg border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-telegram-text font-medium text-lg">{student.name}</h4>
                    <p className="text-telegram-hint text-sm">
                      Telegram ID: {student.telegram_id || 'N/A'}
                    </p>
                  </div>
                  <span className="text-telegram-accent font-mono text-sm bg-telegram-accent/20 px-2 py-1 rounded">
                    {student.mess_no}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-telegram-hint">Department</p>
                    <p className="text-telegram-text font-medium">{student.department}</p>
                  </div>
                  <div>
                    <p className="text-telegram-hint">Year of Study</p>
                    <p className="text-telegram-text font-medium">{student.year_of_study || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-telegram-hint">Mobile Number</p>
                    <p className="text-telegram-text font-medium">{student.mobile_number}</p>
                  </div>
                  <div>
                    <p className="text-telegram-hint">Room Number</p>
                    <p className="text-telegram-text font-medium">{student.room_no || 'N/A'}</p>
                  </div>
                </div>

                {student.is_sahara_inmate && (
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      Sahara Hostel Inmate
                    </span>
                  </div>
                )}

                <div className="text-xs text-telegram-hint mb-4">
                  Registered: {new Date(student.created_at).toLocaleDateString()} at {new Date(student.created_at).toLocaleTimeString()}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStudentApproval(student.id, 'approve')}
                    className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Approve & Activate
                  </button>
                  <button
                    onClick={() => handleStudentApproval(student.id, 'reject')}
                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reject & Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">All Students Verified</h4>
            <p className="text-telegram-hint">No pending student registrations to review</p>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="space-y-4 mt-6">
        {/* Bill Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Bill Management</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleGenerateBills} className="btn-primary text-sm py-2">
              Generate Bills
            </button>
            <button onClick={handleUnpaidStudents} className="btn-secondary text-sm py-2">
              Unpaid Students
            </button>
            <button onClick={handleUnpaidStudents} className="btn-secondary text-sm py-2">
              Payment Verification
            </button>
            <button onClick={handleRevenueReport} className="btn-secondary text-sm py-2">
              Bill Reports
            </button>
          </div>
        </div>

        {/* Student Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Student Management</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleAllStudents} className="btn-secondary text-sm py-2">
              All Students
            </button>
            <button onClick={handleAddStudent} className="btn-secondary text-sm py-2">
              Add Student
            </button>
            <button onClick={handleModifyStudent} className="btn-secondary text-sm py-2">
              Modify Student
            </button>
            <button onClick={handleDeleteStudent} className="btn-secondary text-sm py-2">
              Delete Student
            </button>
          </div>
        </div>

        {/* Communication */}
        <div className="card">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Communication</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={handleSendNotificationAll} className="btn-primary text-sm py-2">
              Send Notification to All
            </button>
            <button onClick={handleSendNotificationSpecific} className="btn-secondary text-sm py-2">
              Send to Specific Students
            </button>
          </div>
        </div>

        {/* Reports */}
        <div className="card">
          <h3 className="text-lg font-semibold text-telegram-text mb-4">Reports & Analytics</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleAttendanceReport} className="btn-secondary text-sm py-2">
              Attendance Report
            </button>
            <button onClick={handleRevenueReport} className="btn-secondary text-sm py-2">
              Revenue Report
            </button>
            <button onClick={handleAttendanceReport} className="btn-secondary text-sm py-2">
              Mess Cut Report
            </button>
            <button onClick={handleRevenueReport} className="btn-secondary text-sm py-2">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
