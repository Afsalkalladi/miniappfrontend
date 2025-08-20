import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentAttendance = ({ onBack }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.attendance.getMyAttendance();
      const attendanceData = response.data.attendance || [];
      
      setAttendance(attendanceData);
      
      // Calculate stats
      const totalDays = attendanceData.length;
      const presentDays = attendanceData.filter(record => record.entered).length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      setStats({
        totalDays,
        presentDays,
        attendanceRate
      });
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const groupAttendanceByDate = (attendanceData) => {
    const grouped = {};
    attendanceData.forEach(record => {
      const date = record.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    return grouped;
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
            <h3 className="text-red-400 font-medium mb-2">Error Loading Attendance</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadAttendance} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedAttendance = groupAttendanceByDate(attendance);

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
        >
          <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">My Attendance</h1>
          <p className="text-telegram-hint">Last 30 days attendance history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 text-center">
          <ChartBarIcon className="w-8 h-8 text-telegram-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-telegram-text">{stats.attendanceRate}%</div>
          <div className="text-telegram-hint text-sm">Attendance Rate</div>
        </div>
        
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 text-center">
          <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-telegram-text">{stats.presentDays}</div>
          <div className="text-telegram-hint text-sm">Present Days</div>
        </div>
        
        <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 text-center">
          <CalendarIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-telegram-text">{stats.totalDays}</div>
          <div className="text-telegram-hint text-sm">Total Days</div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Attendance History</h3>
        
        {attendance.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedAttendance)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, records]) => (
                <div key={date} className="p-4 bg-telegram-bg rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-telegram-hint" />
                      <span className="text-telegram-text font-medium">
                        {formatDate(date)}
                      </span>
                      <span className="text-telegram-hint text-sm">
                        ({new Date(date).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="text-telegram-hint text-sm">
                      {records.length} meal{records.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {records.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-telegram-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMealIcon(record.meal_type)}</span>
                          <div>
                            <div className="text-telegram-text font-medium capitalize">
                              {record.meal_type}
                            </div>
                            <div className="text-telegram-hint text-sm">
                              Marked at {new Date(record.marked_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {record.entered ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span className="text-sm">Present</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <XCircleIcon className="w-4 h-4" />
                              <span className="text-sm">Absent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {records[0]?.scanner_name && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="text-telegram-hint text-sm">
                        Scanned by: {records[0].scanner_name}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Attendance Records</h4>
            <p className="text-telegram-hint">Your attendance history will appear here.</p>
          </div>
        )}
      </div>

      {/* Attendance Rate Indicator */}
      {stats.totalDays > 0 && (
        <div className="mt-6 bg-telegram-secondary rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-telegram-text font-medium">Overall Attendance</span>
            <span className="text-telegram-text font-bold">{stats.attendanceRate}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.attendanceRate >= 75 ? 'bg-green-400' :
                stats.attendanceRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${stats.attendanceRate}%` }}
            ></div>
          </div>
          <div className="mt-2 text-telegram-hint text-sm">
            {stats.attendanceRate >= 75 ? '✅ Excellent attendance!' :
             stats.attendanceRate >= 50 ? '⚠️ Good attendance, keep it up!' : 
             '❌ Low attendance, please improve.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
