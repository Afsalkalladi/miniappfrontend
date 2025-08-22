import axios from 'axios';

// Base API configuration
const API_BASE = 'http://127.0.0.1:8000/api';

// API Error class
class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Generic API request function with error handling
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.details
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0);
  }
}

// Authentication function
async function authenticateUser(telegramId) {
  const response = await fetch(`${API_BASE}/auth/telegram-login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      telegram_id: telegramId
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    
    // Route based on user type
    routeUserBasedOnRole(data.user);
  }
  
  return data;
}

// Role-based routing
function routeUserBasedOnRole(user) {
  if (user.has_admin_access) {
    window.location.href = '/admin-dashboard';
  } else if (user.has_scanner_access) {
    window.location.href = '/staff-scanner';
  } else if (user.has_student_features) {
    window.location.href = '/student-portal';
  }
}

// Get current meal type based on time
function getCurrentMealType() {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  return 'dinner';
}

// API service functions based on comprehensive guide
export const apiService = {
  // Authentication
  auth: {
    authenticateUser,
    refreshToken: async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      return apiRequest(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken })
      });
    }
  },

  // Admin endpoints
  admin: {
    getDashboardStats: () => apiRequest(`${API_BASE}/auth/admin/dashboard-stats/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    getAllStudents: () => apiRequest(`${API_BASE}/students/list/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    updateStudentStatus: (studentId, isApproved) => apiRequest(`${API_BASE}/students/${studentId}/approve/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ is_approved: isApproved })
    }),
    
    generateBills: () => apiRequest(`${API_BASE}/mess/admin/generate-bills/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    getPendingPayments: () => apiRequest(`${API_BASE}/mess/admin/payment-verifications/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    verifyPayment: (billId, action) => apiRequest(`${API_BASE}/mess/bills/${billId}/verify/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ action })
    })
  },

  // Staff endpoints
  staff: {
    getScannerDashboard: () => apiRequest(`${API_BASE}/mess/scanner/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    markAttendance: (messNo, isManual = false) => apiRequest(`${API_BASE}/mess/attendance/mark/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        mess_no: messNo,
        meal_type: getCurrentMealType(),
        is_manual_entry: isManual
      })
    }),
    
    getAttendanceRecords: () => apiRequest(`${API_BASE}/mess/attendance/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  },

  // Student endpoints
  student: {
    getProfile: () => apiRequest(`${API_BASE}/students/profile/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    getBills: () => apiRequest(`${API_BASE}/mess/bills/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
    
    submitPayment: (billId, transactionNumber, paymentMethod = 'UPI') => apiRequest(`${API_BASE}/mess/bills/${billId}/payment/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        transaction_number: transactionNumber,
        payment_method: paymentMethod
      })
    }),
    
    applyMessCut: (fromDate, toDate, reason) => apiRequest(`${API_BASE}/mess/mess-cuts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        from_date: fromDate,
        to_date: toDate,
        reason: reason
      })
    }),
    
    getMyMessCuts: () => apiRequest(`${API_BASE}/mess/mess-cuts/my/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  },

  // Utility functions
  utils: {
    getCurrentMealType,
    routeUserBasedOnRole,
    ApiError
  }
};
