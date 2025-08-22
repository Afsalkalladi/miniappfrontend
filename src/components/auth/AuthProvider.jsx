import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { appState } from '../../utils/stateManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing user data
    const storedUser = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('access_token');
    
    if (storedUser && accessToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        appState.setState('user', userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (telegramId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.auth.authenticateUser(telegramId);
      
      if (data.user) {
        setUser(data.user);
        appState.setState('user', data.user);
        return data.user;
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    appState.setState('user', null);
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.has_admin_access || false,
    isStaff: user?.has_scanner_access || false,
    isStudent: user?.has_student_features || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
