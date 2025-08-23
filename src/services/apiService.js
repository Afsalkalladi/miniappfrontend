// Note: Using native fetch; axios not required

// Base API configuration
const API_BASE = 'https://miniapp-backend-0s1t.onrender.com/api';

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
    // Check if this is a full login response with tokens
    if (data.access_token && data.refresh_token && data.user) {
      // Store tokens for authenticated users
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      // Route based on user type
      routeUserBasedOnRole(data.user);
    } else if (data.registration_status === 'needs_registration') {
      // Store telegram_id for registration process
      localStorage.setItem('telegram_id', telegramId);
      localStorage.setItem('registration_status', 'needs_registration');
    } else if (data.registration_status === 'pending_approval') {
      // Store pending approval status
      localStorage.setItem('telegram_id', telegramId);
      localStorage.setItem('registration_status', 'pending_approval');
      localStorage.setItem('student_data', JSON.stringify(data.student));
    }
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

// Get current meal type based on Asia/Kolkata time
function getCurrentMealType() {
  const now = new Date();
  const kolkataTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const hour = kolkataTime.getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  return 'dinner';
}

// Get current date in Asia/Kolkata timezone
function getCurrentDateKolkata() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

// Check if mess cut can be taken (before 9 PM Kolkata time)
function canTakeMessCut() {
  const kolkataTime = getCurrentDateKolkata();
  return kolkataTime.getHours() < 21; // Before 9 PM
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

    // Bills management
    generateBills: () => apiRequest(`${API_BASE}/mess/admin/generate-bills/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    deleteBill: (billId) => apiRequest(`${API_BASE}/mess/bills/${billId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    modifyBill: (billId, data) => apiRequest(`${API_BASE}/mess/bills/${billId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    }),

    getPaidStudents: () => apiRequest(`${API_BASE}/mess/admin/paid-students/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getUnpaidStudents: () => apiRequest(`${API_BASE}/mess/admin/unpaid-students/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    // Fines management
    imposeFine: (studentId, amount, reason) => apiRequest(`${API_BASE}/mess/admin/fines/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ student_id: studentId, amount, reason })
    }),

    editFine: (fineId, data) => apiRequest(`${API_BASE}/mess/admin/fines/${fineId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    }),

    // Reports
    getMessCutLogs: (startDate, endDate) => apiRequest(`${API_BASE}/mess/admin/reports/mess-cuts/?start_date=${startDate}&end_date=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getPaymentLogs: (startDate, endDate) => apiRequest(`${API_BASE}/mess/admin/reports/payments/?start_date=${startDate}&end_date=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getStudentLogs: () => apiRequest(`${API_BASE}/mess/admin/reports/students/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getAttendanceLogs: (startDate, endDate) => apiRequest(`${API_BASE}/mess/admin/reports/attendance/?start_date=${startDate}&end_date=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    // Notifications
    sendBulkNotification: (message, targetGroup) => apiRequest(`${API_BASE}/mess/admin/notifications/bulk/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ message, target_group: targetGroup })
    }),

    sendIndividualNotification: (studentId, message) => apiRequest(`${API_BASE}/mess/admin/notifications/individual/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ student_id: studentId, message })
    }),

    // QR Scanning for admin
    markAttendance: (messNo, mealType, date) => apiRequest(`${API_BASE}/mess/attendance/mark/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        mess_no: messNo,
        meal_type: mealType || getCurrentMealType(),
        date: date || new Date().toISOString().split('T')[0],
        is_manual_entry: false
      })
    }),

    getTodayAttendanceStats: () => apiRequest(`${API_BASE}/auth/admin/attendance-stats/today/`, {
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
    }),

    getPendingPayments: async () => {
      const response = await apiRequest(`${API_BASE}/mess/admin/payments/pending/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data?.pending_bills || [];
    },

    modifyBill: (billId, data) => apiRequest(`${API_BASE}/mess/bills/${billId}/modify/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    }),

    imposeFine: (studentId, fineAmount, fineReason) => apiRequest(`${API_BASE}/mess/admin/create-fine/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        student_id: studentId,
        fine_amount: fineAmount,
        fine_reason: fineReason
      })
    }),

    addOverdueFines: (daysOverdue, fineAmount, fineReason) => apiRequest(`${API_BASE}/mess/bills/add-overdue-fines/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        days_overdue: daysOverdue,
        fine_amount: fineAmount,
        fine_reason: fineReason
      })
    }),

    // Reports API methods
    getMessCutLogs: (fromDate, toDate) => apiRequest(`${API_BASE}/mess/admin/reports/mess-cuts/?from_date=${fromDate}&to_date=${toDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getPaymentLogs: (fromDate, toDate) => apiRequest(`${API_BASE}/mess/admin/reports/payments/?from_date=${fromDate}&to_date=${toDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getStudentLogs: () => apiRequest(`${API_BASE}/mess/admin/reports/students/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getAttendanceLogs: (fromDate, toDate) => apiRequest(`${API_BASE}/mess/admin/reports/attendance/?from_date=${fromDate}&to_date=${toDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  },

  // Staff endpoints
  staff: {
    getScannerDashboard: () => apiRequest(`${API_BASE}/mess/scanner/dashboard/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getStudentInfo: (messNo) => apiRequest(`${API_BASE}/mess/scanner/student/${messNo}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    markAttendance: (attendanceData) => apiRequest(`${API_BASE}/mess/attendance/mark/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(attendanceData)
    }),

    getAttendanceRecords: () => apiRequest(`${API_BASE}/mess/attendance/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  },

  // Student endpoints
  students: {
    // Registration expects multipart/form-data without auth
    register: async (registrationData) => {
      // If caller passed a FormData, use it directly
      let formData;
      if (registrationData instanceof FormData) {
        formData = registrationData;
      } else {
        formData = new FormData();
        Object.entries(registrationData || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null) formData.append(k, v);
        });
      }

      const res = await fetch(`${API_BASE}/auth/register-student/`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new ApiError(data?.error || data?.message || 'Registration failed', res.status, data);
      }
      return data;
    },

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
    }),

    // Student dashboard stats
    getDashboardStats: () => apiRequest(`${API_BASE}/students/dashboard-stats/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    // Get QR code for student
    getQRCode: () => apiRequest(`${API_BASE}/students/qr-code/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    // Payment QR code generation
    getPaymentQR: (billId) => apiRequest(`${API_BASE}/mess/payment/generate-qr/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ bill_id: billId })
    }),

    // Submit payment details
    submitPayment: (billId, transactionId, paymentMethod = 'UPI') => apiRequest(`${API_BASE}/mess/payment/submit/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        bill_id: billId,
        transaction_id: transactionId,
        payment_method: paymentMethod
      })
    }),

    // Get today's menu
    getTodaysMenu: () => apiRequest(`${API_BASE}/mess/menu/today/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),
  },

  // Backward compatibility alias
  student: {
    register: async (registrationData) => apiService.students.register(registrationData),

    getProfile: () => apiRequest(`${API_BASE}/students/profile/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    }),

    getBills: () => apiRequest(`${API_BASE}/mess/bills/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
  },

  // Utility functions
  utils: {
    getCurrentMealType,
    getCurrentDateKolkata,
    canTakeMessCut,
    routeUserBasedOnRole,
    ApiError
  }
};
