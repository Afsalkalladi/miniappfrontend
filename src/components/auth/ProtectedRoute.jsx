import React from 'react';
import { useAuth } from './AuthProvider';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false, requireStudent = false }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Please log in to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requireAdmin && !user.has_admin_access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You don't have admin privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (requireStaff && !user.has_scanner_access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You don't have staff privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (requireStudent && !user.has_student_features) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You don't have student privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
