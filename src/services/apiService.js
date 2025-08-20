import axios from 'axios';

const API_BASE_URL = 'https://miniapp-backend-0s1t.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  auth: {
    loginWithTelegram: (data) => api.post('/auth/telegram-login/', data),
    registerStudent: (data) => api.post('/auth/register-student/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
  },

  bills: {
    getCurrentBill: () => api.get('/mess/bills/current/'),
    getAllBills: () => api.get('/mess/bills/all/'),
    submitPayment: (billId, data) => api.post(`/mess/bills/${billId}/payment/`, data),
  },

  attendance: {
    markAttendance: (data) => api.post('/mess/attendance/mark/', data),
    getMyAttendance: () => api.get('/mess/attendance/my/'),
  },

  messCuts: {
    apply: (data) => api.post('/mess/mess-cuts/', data),
    getMyCuts: () => api.get('/mess/mess-cuts/my/'),
  },

  scanner: {
    scanQR: (data) => api.post('/mess/attendance/mark/', data),
    getStats: () => api.get('/mess/scanner/stats/'),
  },

  admin: {
    getDashboardStats: () => api.get('/auth/admin/dashboard-stats/'),
    getPendingStudents: () => api.get('/auth/admin/pending-students/'),
    approveStudent: (studentId) => api.post(`/auth/admin/approve-student/${studentId}/`),
    rejectStudent: (studentId) => api.post(`/auth/admin/reject-student/${studentId}/`),
  },

  // Superuser endpoints removed - using Django admin for whitelist management

  student: {
    regenerateQR: () => api.post('/students/regenerate-qr/'),
    getNotifications: () => api.get('/notifications/my/'),
    markNotificationRead: (notificationId) => api.post(`/notifications/${notificationId}/read/`),
  },
};
