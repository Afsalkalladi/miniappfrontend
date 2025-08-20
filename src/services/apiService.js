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
    registerStudent: (data) => {
      // Handle FormData for file uploads
      const config = {};
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data',
        };
      }
      return api.post('/auth/register-student/', data, config);
    },
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
  },

  bills: {
    getCurrentBill: () => api.get('/mess/bills/current/'),
    getAllBills: () => api.get('/mess/bills/'),
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

    // Bill Management
    generateBills: (data) => api.post('/mess/admin/generate-bills/', data),
    getUnpaidStudents: () => api.get('/mess/admin/unpaid-students/'),
    verifyPayment: (billId, data) => api.post(`/mess/admin/verify-payment/${billId}/`, data),
    getBillReports: (params) => api.get('/mess/admin/bill-reports/', { params }),

    // Student Management
    getAllStudents: (params) => api.get('/mess/admin/students/', { params }),
    addStudent: (data) => api.post('/mess/admin/students/', data),
    updateStudent: (studentId, data) => api.put(`/mess/admin/students/${studentId}/`, data),
    deleteStudent: (studentId) => api.delete(`/mess/admin/students/${studentId}/`),

    // Communication
    sendNotificationToAll: (data) => api.post('/mess/admin/notifications/broadcast/', data),
    sendNotificationToSpecific: (data) => api.post('/mess/admin/notifications/targeted/', data),

    // Student Management
    getAllStudents: (params) => api.get('/students/list/', { params }),
    getStudentDetails: (messNo) => api.get(`/students/${messNo}/`),

    // Reports
    getAttendanceReport: (params) => api.get('/mess/admin/reports/attendance/', { params }),
    getRevenueReport: (params) => api.get('/mess/admin/reports/revenue/', { params }),
    getMessCutReport: (params) => api.get('/mess/admin/reports/mess-cuts/', { params }),
    exportData: (type, params) => api.get(`/mess/admin/export/${type}/`, { params, responseType: 'blob' }),
  },

  // Superuser endpoints removed - using Django admin for whitelist management

  student: {
    regenerateQR: () => api.post('/students/regenerate-qr/'),
    getNotifications: () => api.get('/notifications/my/'),
    markNotificationRead: (notificationId) => api.post(`/notifications/${notificationId}/read/`),
  },

  notifications: {
    sendToAll: (data) => api.post('/notifications/send-to-all/', data),
    sendToStudent: (studentId, data) => api.post(`/notifications/send-to-student/${studentId}/`, data),
    getStats: () => api.get('/notifications/stats/'),
  },

  // Bills endpoints for students
  bills: {
    getCurrentBill: () => api.get('/mess/bills/current/'),
    getAllBills: () => api.get('/mess/bills/'),
    submitPayment: (billId, data) => api.post(`/mess/bills/${billId}/payment/`, data),
  },

  // Attendance endpoints for students
  attendance: {
    getMyAttendance: () => api.get('/mess/attendance/my/'),
    markAttendance: (data) => api.post('/mess/attendance/mark/', data),
  },

  // Mess cuts endpoints for students
  messCuts: {
    getMyMessCuts: () => api.get('/mess/mess-cuts/my/'),
    applyMessCut: (data) => api.post('/mess/mess-cuts/', data),
  },
};
