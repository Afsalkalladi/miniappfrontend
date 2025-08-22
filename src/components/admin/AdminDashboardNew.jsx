import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { showError, showSuccess } from '../../utils/errorHandler';
import StatsCard from '../common/StatsCard';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData, paymentsData] = await Promise.all([
        apiService.admin.getDashboardStats(),
        apiService.admin.getAllStudents(),
        apiService.admin.getPendingPayments()
      ]);
      
      setStats(statsData);
      setStudents(studentsData);
      setPendingPayments(paymentsData);
    } catch (error) {
      showError('Failed to load dashboard data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentApproval = async (studentId, isApproved) => {
    try {
      await apiService.admin.updateStudentStatus(studentId, isApproved);
      showSuccess(`Student ${isApproved ? 'approved' : 'rejected'} successfully`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to update student status', error.message);
    }
  };

  const handlePaymentVerification = async (billId, action) => {
    try {
      await apiService.admin.verifyPayment(billId, action);
      showSuccess(`Payment ${action}d successfully`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to verify payment', error.message);
    }
  };

  const handleGenerateBills = async () => {
    try {
      await apiService.admin.generateBills();
      showSuccess('Bills generated successfully');
      loadDashboardData(); // Refresh data
    } catch (error) {
      showError('Failed to generate bills', error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Mess Management System</p>
            </div>
            <button
              onClick={handleGenerateBills}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Bills
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        <div id="error-container" style={{ display: 'none' }}></div>
        <div id="success-container" style={{ display: 'none' }}></div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Students"
              value={stats.students?.total_students || 0}
              subtitle={`${stats.students?.approved_students || 0} approved, ${stats.students?.pending_students || 0} pending`}
              icon="👥"
              color="blue"
            />
            <StatsCard
              title="Monthly Revenue"
              value={`₹${stats.bills?.total_revenue?.toLocaleString() || 0}`}
              subtitle="From paid bills"
              icon="💰"
              color="green"
            />
            <StatsCard
              title="Today's Attendance"
              value={stats.attendance?.today_attendance || 0}
              subtitle={`Total scans: ${stats.attendance?.total_scans || 0}`}
              icon="📊"
              color="purple"
            />
            <StatsCard
              title="Unpaid Bills"
              value={stats.bills?.unpaid_bills || 0}
              subtitle={`${stats.bills?.payment_submitted || 0} payment submitted`}
              icon="⚠️"
              color="red"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'students', name: 'Student Management', icon: '👥' },
                { id: 'payments', name: 'Payment Verification', icon: '💳' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Student Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Students:</span>
                        <span className="font-semibold">{stats.students?.total_students || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved:</span>
                        <span className="font-semibold text-green-600">{stats.students?.approved_students || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-semibold text-yellow-600">{stats.students?.pending_students || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sahara Inmates:</span>
                        <span className="font-semibold">{stats.students?.sahara_inmates || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bill Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Bills:</span>
                        <span className="font-semibold">{stats.bills?.total_bills || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unpaid Bills:</span>
                        <span className="font-semibold text-red-600">{stats.bills?.unpaid_bills || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Submitted:</span>
                        <span className="font-semibold text-blue-600">{stats.bills?.payment_submitted || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-semibold text-green-600">₹{stats.bills?.total_revenue?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Student Management Tab */}
            {activeTab === 'students' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mess No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.mobile_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.mess_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.is_approved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {!student.is_approved && (
                              <>
                                <button
                                  onClick={() => handleStudentApproval(student.id, true)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStudentApproval(student.id, false)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Verification Tab */}
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Verification</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.student_name}</div>
                            <div className="text-sm text-gray-500">{payment.mess_no}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{payment.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.transaction_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handlePaymentVerification(payment.bill_id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handlePaymentVerification(payment.bill_id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingPayments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No pending payments to verify
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
