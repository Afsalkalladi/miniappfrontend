import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';

// Main Components
import AdminPanel from './components/admin/AdminPanel';
import StaffPanel from './components/staff/StaffPanel';
import StudentPanel from './components/student/StudentPanel';

// Common Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminScannerPage from './components/admin/AdminScannerPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginPage />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-scanner" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminScannerPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Staff Routes */}
              <Route 
                path="/staff-scanner" 
                element={
                  <ProtectedRoute requireStaff={true}>
                    <StaffPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Student Routes */}
              <Route 
                path="/student-portal" 
                element={
                  <ProtectedRoute requireStudent={true}>
                    <StudentPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;