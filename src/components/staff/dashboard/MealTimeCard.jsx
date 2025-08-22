import React from 'react';
import { Card } from '../../common/ui';

const MealTimeCard = ({ currentMeal }) => {
  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTime = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '7:00 AM - 10:00 AM';
      case 'lunch': return '12:00 PM - 3:00 PM';
      case 'dinner': return '7:00 PM - 10:00 PM';
      default: return '';
    }
  };

  return (
    <Card className="mb-6">
      <div className="text-center">
        <div className="text-4xl mb-2">{getMealIcon(currentMeal)}</div>
        <h3 className="text-telegram-text font-semibold text-lg capitalize mb-1">
          {currentMeal} Time
        </h3>
        <p className="text-telegram-hint text-sm">
          {getMealTime(currentMeal)}
        </p>
      </div>
    </Card>
  );
};

export default MealTimeCard;
