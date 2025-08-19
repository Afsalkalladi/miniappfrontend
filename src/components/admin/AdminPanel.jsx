import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
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
  const { user } = useAuthStore();
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
      await apiService.admin.approveStudent(studentId, { action });
      
      // Remove from pending list
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Failed to process student approval:', error);
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  // Check if user has admin access
  if (!user?.has_admin_access) {
    return (
      <div className="p-4 pb-20">
        <div className="text-center py-12">
          <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-telegram-text text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-telegram-hint">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

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
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">Admin Panel</h1>
        <p className="text-telegram-hint">Manage students, bills, and system settings</p>
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
          Pending Approvals ({pendingStudents.length})
        </h3>
        
        {pendingStudents.length > 0 ? (
          <div className="space-y-3">
            {pendingStudents.map((student) => (
              <div key={student.id} className="p-3 bg-telegram-bg rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-telegram-text font-medium">{student.name}</h4>
                    <p className="text-telegram-hint text-sm">
                      {student.department} • {student.mobile_number}
                    </p>
                  </div>
                  <span className="text-telegram-hint text-xs">
                    {student.mess_no}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleStudentApproval(student.id, 'approve')}
                    className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStudentApproval(student.id, 'reject')}
                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-telegram-hint">No pending approvals</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button className="card text-center hover:bg-telegram-bg transition-colors">
          <CurrencyRupeeIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
          <span className="text-telegram-text font-medium">Generate Bills</span>
        </button>
        
        <button className="card text-center hover:bg-telegram-bg transition-colors">
          <ChartBarIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
          <span className="text-telegram-text font-medium">View Reports</span>
        </button>
        
        <button className="card text-center hover:bg-telegram-bg transition-colors">
          <UsersIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
          <span className="text-telegram-text font-medium">Manage Students</span>
        </button>
        
        <button className="card text-center hover:bg-telegram-bg transition-colors">
          <ClockIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
          <span className="text-telegram-text font-medium">Attendance Log</span>
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
