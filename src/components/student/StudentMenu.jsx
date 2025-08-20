import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const StudentMenu = ({ onBack }) => {
  const [menu, setMenu] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMenu();
  }, [selectedDate]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load today's menu and weekly menu
      const [todayResponse, weeklyResponse] = await Promise.all([
        apiService.menu.getTodayMenu().catch(() => ({ data: null })),
        apiService.menu.getWeeklyMenu({ date: selectedDate }).catch(() => ({ data: { menu: [] } }))
      ]);

      setTodayMenu(todayResponse.data);
      setMenu(weeklyResponse.data.menu || []);
    } catch (error) {
      console.error('Failed to load menu:', error);
      setError('Failed to load menu');
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
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getCurrentMeal = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 10) return 'breakfast';
    if (hour < 15) return 'lunch';
    return 'dinner';
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
            <h3 className="text-red-400 font-medium mb-2">Error Loading Menu</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadMenu} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMeal = getCurrentMeal();

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
          <h1 className="text-2xl font-bold text-telegram-text">Food Menu</h1>
          <p className="text-telegram-hint">Today's menu and weekly schedule</p>
        </div>
      </div>

      {/* Today's Menu Highlight */}
      {todayMenu && (
        <div className="bg-gradient-to-r from-telegram-accent/20 to-blue-500/20 rounded-lg p-6 border border-telegram-accent/30 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="w-6 h-6 text-telegram-accent" />
            <h3 className="text-lg font-semibold text-telegram-text">Today's Special</h3>
            <span className="text-telegram-hint text-sm">
              ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {todayMenu.meals?.map((meal, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  meal.meal_type === currentMeal 
                    ? 'bg-telegram-accent/20 border-telegram-accent' 
                    : 'bg-telegram-secondary border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getMealIcon(meal.meal_type)}</span>
                  <div>
                    <h4 className="text-telegram-text font-medium capitalize">{meal.meal_type}</h4>
                    <p className="text-telegram-hint text-sm">{meal.time}</p>
                  </div>
                  {meal.meal_type === currentMeal && (
                    <span className="ml-auto bg-telegram-accent text-white px-2 py-1 rounded-full text-xs">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {meal.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <span className="text-telegram-text">{item.name}</span>
                      {item.is_special && (
                        <span className="text-yellow-400 text-sm">⭐ Special</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-5 h-5 text-telegram-hint" />
          <label className="text-telegram-text font-medium">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-telegram-bg border border-gray-600 rounded px-3 py-2 text-telegram-text"
          />
        </div>
      </div>

      {/* Weekly Menu */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Weekly Menu</h3>
        
        {menu.length > 0 ? (
          <div className="space-y-4">
            {menu.map((dayMenu, index) => (
              <div key={index} className="p-4 bg-telegram-bg rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-telegram-hint" />
                    <span className="text-telegram-text font-medium">
                      {formatDate(dayMenu.date)}
                    </span>
                    <span className="text-telegram-hint text-sm">
                      ({new Date(dayMenu.date).toLocaleDateString()})
                    </span>
                  </div>
                  {new Date(dayMenu.date).toDateString() === new Date().toDateString() && (
                    <span className="bg-telegram-accent text-white px-2 py-1 rounded-full text-xs">
                      Today
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dayMenu.meals?.map((meal, mealIndex) => (
                    <div key={mealIndex} className="p-3 bg-telegram-secondary rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getMealIcon(meal.meal_type)}</span>
                        <div>
                          <h5 className="text-telegram-text font-medium capitalize">{meal.meal_type}</h5>
                          <p className="text-telegram-hint text-xs">{meal.time}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {meal.items?.map((item, itemIndex) => (
                          <div key={itemIndex} className="text-telegram-text text-sm">
                            {item.name}
                            {item.is_special && <span className="text-yellow-400 ml-1">⭐</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Menu Available</h4>
            <p className="text-telegram-hint">Menu for selected date is not available yet.</p>
          </div>
        )}
      </div>

      {/* Menu Legend */}
      <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mt-6">
        <h4 className="text-telegram-text font-medium mb-3">Legend</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌅</span>
            <span className="text-telegram-text">Breakfast (7:00 - 10:00 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌞</span>
            <span className="text-telegram-text">Lunch (12:00 - 3:00 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <span className="text-telegram-text">Dinner (7:00 - 10:00 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⭐</span>
            <span className="text-telegram-text">Special Item</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMenu;
