import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiService } from '../../services/apiService';
import { ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const response = await apiService.attendance.getMyAttendance();
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setAttendance([]);
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

  const getMealColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'text-orange-400 bg-orange-400/20';
      case 'lunch': return 'text-yellow-400 bg-yellow-400/20';
      case 'dinner': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Group attendance by date
  const groupedAttendance = attendance.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

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
        <h1 className="text-2xl font-bold text-telegram-text mb-2">My Attendance</h1>
        <p className="text-telegram-hint">View your mess attendance history (last 30 days)</p>
      </div>

      {/* Attendance Summary */}
      {attendance.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-telegram-text mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-telegram-accent">
                {attendance.filter(a => a.meal_type === 'breakfast').length}
              </div>
              <div className="text-telegram-hint text-sm">Breakfast</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-telegram-accent">
                {attendance.filter(a => a.meal_type === 'lunch').length}
              </div>
              <div className="text-telegram-hint text-sm">Lunch</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-telegram-accent">
                {attendance.filter(a => a.meal_type === 'dinner').length}
              </div>
              <div className="text-telegram-hint text-sm">Dinner</div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="space-y-4">
        {Object.entries(groupedAttendance)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([date, records]) => (
            <div key={date} className="card">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-5 h-5 text-telegram-hint" />
                <span className="text-telegram-text font-medium">
                  {format(new Date(date), 'EEEE, MMM dd, yyyy')}
                </span>
              </div>

              <div className="space-y-2">
                {records.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-telegram-bg rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMealIcon(record.meal_type)}</span>
                      <div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMealColor(record.meal_type)}`}>
                          {record.meal_type.charAt(0).toUpperCase() + record.meal_type.slice(1)}
                        </div>
                        {record.scanner_name && (
                          <p className="text-telegram-hint text-xs mt-1">
                            Scanned by: {record.scanner_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-telegram-hint text-sm">
                      {format(new Date(record.marked_at), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {attendance.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h3 className="text-telegram-text text-lg font-medium mb-2">No Attendance Records</h3>
            <p className="text-telegram-hint">Your attendance records will appear here once you start using the mess.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
