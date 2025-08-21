import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/apiService';
import { 
  UsersIcon, 
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const SuperuserPanel = () => {
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadSuperuserData();
  }, []);

  const loadSuperuserData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        apiService.superuser.getAllUsers().catch(() => ({ data: [] })),
        apiService.superuser.getSystemStats().catch(() => ({ data: null }))
      ]);
      
      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load superuser data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.superuser.assignRole(userId, { role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      
      // Haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superuser': return <ShieldCheckIcon className="w-5 h-5 text-purple-400" />;
      case 'admin': return <CogIcon className="w-5 h-5 text-blue-400" />;
      case 'staff': return <QrCodeIcon className="w-5 h-5 text-green-400" />;
      case 'student': return <AcademicCapIcon className="w-5 h-5 text-yellow-400" />;
      default: return <UserIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superuser': return 'text-purple-400 bg-purple-400/20';
      case 'admin': return 'text-blue-400 bg-blue-400/20';
      case 'staff': return 'text-green-400 bg-green-400/20';
      case 'student': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
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
          <h1 className="text-2xl font-bold text-telegram-text">Superuser Panel</h1>
          <p className="text-telegram-hint">System Administration & Role Management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-telegram-text font-medium">{user?.first_name} {user?.last_name}</p>
            <p className="text-purple-400 text-sm">Superuser</p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <UsersIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.total_users || 0}</div>
            <div className="text-telegram-hint text-sm">Total Users</div>
          </div>
          
          <div className="card text-center">
            <AcademicCapIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.total_students || 0}</div>
            <div className="text-telegram-hint text-sm">Students</div>
          </div>
          
          <div className="card text-center">
            <CogIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.total_admins || 0}</div>
            <div className="text-telegram-hint text-sm">Admins</div>
          </div>
          
          <div className="card text-center">
            <QrCodeIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-telegram-text">{stats.total_staff || 0}</div>
            <div className="text-telegram-hint text-sm">Staff</div>
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-telegram-text mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          User Role Management ({users.length})
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map((userItem) => (
            <div key={userItem.id} className="p-3 bg-telegram-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getRoleIcon(userItem.role)}
                  <div>
                    <h4 className="text-telegram-text font-medium">
                      {userItem.first_name} {userItem.last_name}
                    </h4>
                    <p className="text-telegram-hint text-sm">
                      @{userItem.username} • ID: {userItem.telegram_id}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(userItem.role)}`}>
                  {userItem.role.toUpperCase()}
                </div>
              </div>
              
              {userItem.id !== user.id && (
                <div className="mt-3">
                  <label className="block text-telegram-text text-sm mb-1">Assign Role:</label>
                  <select
                    value={userItem.role}
                    onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                    className="w-full p-2 bg-telegram-secondary text-telegram-text rounded border border-gray-600 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="superuser">Superuser</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-6">
            <UsersIcon className="w-12 h-12 text-telegram-hint mx-auto mb-2" />
            <p className="text-telegram-hint">No users found</p>
          </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-telegram-text mb-3">Role Descriptions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Superuser:</span>
            <span className="text-telegram-hint">Full system access, role management</span>
          </div>
          <div className="flex items-center gap-2">
            <CogIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Admin:</span>
            <span className="text-telegram-hint">Admin dashboard, student management</span>
          </div>
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">Staff:</span>
            <span className="text-telegram-hint">QR scanner access only</span>
          </div>
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Student:</span>
            <span className="text-telegram-hint">Mess management features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperuserPanel;
