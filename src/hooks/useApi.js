// Custom hooks for API operations
import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
};

export const useStudentOperations = () => {
  const { loading, error, execute } = useApiCall();

  const approveStudent = useCallback((studentId) => 
    execute(() => apiService.admin.approveStudent(studentId)), [execute]);

  const rejectStudent = useCallback((studentId) => 
    execute(() => apiService.admin.rejectStudent(studentId)), [execute]);

  const deleteStudent = useCallback((studentId) => 
    execute(() => apiService.admin.deleteStudent(studentId)), [execute]);

  const loadStudents = useCallback((params) => 
    execute(() => apiService.admin.getAllStudents(params)), [execute]);

  return {
    loading,
    error,
    approveStudent,
    rejectStudent,
    deleteStudent,
    loadStudents
  };
};

export const useBillOperations = () => {
  const { loading, error, execute } = useApiCall();

  const generateBills = useCallback((billData) => 
    execute(() => apiService.admin.generateBills(billData)), [execute]);

  const publishBills = useCallback((data) => 
    execute(() => apiService.admin.publishBills(data)), [execute]);

  const submitPayment = useCallback((billId, paymentData) => 
    execute(() => apiService.bills.submitPayment(billId, paymentData)), [execute]);

  const loadBills = useCallback(() => 
    execute(() => apiService.students.getBills()), [execute]);

  return {
    loading,
    error,
    generateBills,
    publishBills,
    submitPayment,
    loadBills
  };
};
