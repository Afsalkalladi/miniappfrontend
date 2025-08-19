import { create } from 'zustand';
import { apiService } from '../services/apiService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  initializeUser: async (telegramUser) => {
    try {
      set({ isLoading: true, error: null });
      
      // Register/login user with backend
      const response = await apiService.auth.loginWithTelegram({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      });

      // Store auth token
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      set({ 
        user: response.data.user, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Auth error:', error);
      set({ 
        error: error.response?.data?.error || error.message, 
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
