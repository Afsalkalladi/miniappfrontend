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

      // Try to login with Telegram data
      const response = await apiService.auth.loginWithTelegram({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      });

      if (response.data.needs_registration) {
        // New student user - show registration form
        set({
          needsRegistration: true,
          isLoading: false,
          error: null
        });
      } else {
        // User exists (student/admin/staff) - proceed with login
        // Store auth token
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }

        set({
          user: response.data.user,
          isLoading: false,
          needsRegistration: false
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      set({
        error: error.response?.data?.error || 'Authentication failed',
        isLoading: false
      });
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
