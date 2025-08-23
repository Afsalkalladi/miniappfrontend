import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminQRScanner from './AdminQRScanner';

const AdminScannerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminQRScanner onBack={() => navigate('/admin-dashboard')} />
    </div>
  );
};

export default AdminScannerPage;
