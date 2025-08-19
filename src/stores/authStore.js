import { create } from 'zustand';
import { apiService } from '../services/apiService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  needsRegistration: false,
  telegramUser: null,

  initializeUser: async (telegramUser) => {
    try {
      set({ isLoading: true, error: null, telegramUser });

      // Try to login with existing user
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

      // Check if user needs to complete registration
      if (response.data.user && !response.data.user.student) {
        set({
          needsRegistration: true,
          isLoading: false
        });
      } else {
        set({
          user: response.data.user,
          isLoading: false,
          needsRegistration: false
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      // If user doesn't exist, show registration
      if (error.response?.status === 404 || error.response?.data?.error?.includes('not found')) {
        set({
          needsRegistration: true,
          isLoading: false,
          error: null
        });
      } else {
        set({
          error: error.response?.data?.error || error.message,
          isLoading: false
        });
      }
    }
  },

  completeRegistration: (user) => {
    set({
      user,
      needsRegistration: false,
      error: null
    });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      error: null,
      needsRegistration: false,
      telegramUser: null
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
