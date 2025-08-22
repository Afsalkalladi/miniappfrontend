import React from 'react';
import { Card } from '../../common/ui';

const StatsCard = ({ stats }) => {
  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  if (!stats) return null;

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Today's Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-telegram-accent">{stats.today_scans || 0}</div>
          <div className="text-telegram-hint text-sm">Total Scans</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.unique_students || 0}</div>
          <div className="text-telegram-hint text-sm">Unique Students</div>
        </div>
      </div>

      {/* Meal Breakdown */}
      <div className="space-y-2">
        <h4 className="text-telegram-text font-medium text-sm">Meal Breakdown:</h4>
        {['breakfast', 'lunch', 'dinner'].map((meal) => (
          <div key={meal} className="flex items-center justify-between p-2 bg-telegram-bg rounded">
            <div className="flex items-center gap-2">
              <span>{getMealIcon(meal)}</span>
              <span className="text-telegram-text text-sm capitalize">{meal}</span>
            </div>
            <span className="text-telegram-text font-medium">
              {stats.meal_breakdown?.[meal] || 0}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatsCard;
