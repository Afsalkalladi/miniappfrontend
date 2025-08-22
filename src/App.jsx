import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';

// Main Components
import AdminDashboard from './components/admin/AdminDashboardNew';
import StaffScanner from './components/staff/StaffScannerNew';
import StudentPortal from './components/student/StudentPortalNew';

// Common Components
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

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
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Staff Routes */}
              <Route 
                path="/staff-scanner" 
                element={
                  <ProtectedRoute requireStaff={true}>
                    <StaffScanner />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Student Routes */}
              <Route 
                path="/student-portal" 
                element={
                  <ProtectedRoute requireStudent={true}>
                    <StudentPortal />
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