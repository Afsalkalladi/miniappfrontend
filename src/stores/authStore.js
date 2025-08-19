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

      // Check if user exists by Telegram ID
      const response = await apiService.auth.checkTelegramUser(telegramUser.id.toString());

      if (response.data.exists) {
        // User exists, proceed with login
        const loginResponse = await apiService.auth.loginWithTelegram({
          telegram_id: telegramUser.id.toString(),
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
        });

        // Store auth token
        if (loginResponse.data.token) {
          localStorage.setItem('auth_token', loginResponse.data.token);
        }

        set({
          user: loginResponse.data.user,
          isLoading: false,
          needsRegistration: false
        });
      } else {
        // New user, show registration form
        set({
          needsRegistration: true,
          isLoading: false,
          error: null
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
