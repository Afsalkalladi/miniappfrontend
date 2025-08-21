import axios from 'axios';

const API_BASE_URL = 'https://miniapp-backend-0s1t.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.reload();
        }
      } else {
        // No refresh token, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility function to get current meal based on server time (Asia/Kolkata)
const getCurrentMeal = () => {
  const now = new Date();
  const kolkataTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hour = kolkataTime.getHours();
  
  if (hour >= 6 && hour < 10) return 'breakfast';
  if (hour >= 12 && hour < 15) return 'lunch';
  if (hour >= 19 && hour < 22) return 'dinner';
  return null;
};

// Utility function to get current date in Asia/Kolkata timezone
const getCurrentDate = () => {
  const now = new Date();
  const kolkataTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return kolkataTime.toISOString().split('T')[0];
};

export const apiService = {
  // Authentication endpoints
  auth: {
    loginWithTelegram: (data) => api.post('/auth/telegram-login/', data),
  },

  // Student endpoints
  students: {
    register: (data) => api.post('/students/register/', data),
    getRegistrationStatus: () => api.get('/students/registration-status/'),
    getProfile: () => api.get('/students/profile/'),
    getDashboardStats: () => api.get('/students/dashboard-stats/'),
    getBills: (params) => api.get('/students/bills/', { params }),
    generatePaymentQR: (data) => api.post('/students/generate-payment-qr/', data),
    submitPayment: (billId, data) => api.post(`/students/bills/${billId}/submit-payment/`, data),
  },

  // Mess cuts endpoints
  messCuts: {
    getStudentMessCuts: (params) => api.get('/mess/mess-cuts/', { params }),
    applyMessCut: (data) => api.post('/mess/mess-cuts/', data),
    cancelMessCut: (id) => api.delete(`/mess/mess-cuts/${id}/`),
  },

  // Scanner endpoints (for admin/staff)
  scanner: {
    scanStudent: (data) => api.post('/mess/scan/student/', {
      ...data,
      meal_type: data.meal_type || getCurrentMeal(),
      date: data.date || getCurrentDate()
    }),
    getStats: (params) => api.get('/mess/scanner/stats/', { params }),
  },

  // Admin endpoints
  admin: {
    // Dashboard
    getDashboardStats: () => api.get('/mess/admin/dashboard-stats/'),
    
    // Bills Management
    generateBills: (data) => api.post('/mess/bills/generate/', data),
    getBills: (params) => api.get('/mess/bills/', { params }),
    addFine: (billId, data) => api.post(`/mess/bills/${billId}/add-fine/`, data),
    addOverdueFines: (data) => api.post('/mess/bills/add-overdue-fines/', data),
    
    // Reports
    getMessCutLogs: (params) => api.get('/mess/reports/mess-cuts/', { params }),
    getPaymentLogs: (params) => api.get('/mess/reports/payments/', { params }),
    getStudentActivity: (params) => api.get('/mess/reports/students/', { params }),
    getAttendanceLogs: (params) => api.get('/mess/reports/attendance/', { params }),
  },

  // Notifications endpoints
  notifications: {
    sendBulk: (data) => api.post('/notifications/send-bulk/', data),
    sendIndividual: (data) => api.post('/notifications/send-individual/', data),
  },

  // Utility functions
  utils: {
    getCurrentMeal,
    getCurrentDate,
  },
};
