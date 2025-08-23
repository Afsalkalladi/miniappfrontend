import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  UsersIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';

const AdminReports = ({ user, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const [dateRange, setDateRange] = useState({
    from_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0]
  });

  const generateMessCutReport = async () => {
    try {
      setLoading(true);
      setActiveReport('mess-cuts');
      const response = await apiService.admin.getMessCutLogs(dateRange.from_date, dateRange.to_date);
      setReportData(response);
      showToast('Mess cut report generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate mess cut report:', error);
      showToast('Failed to generate mess cut report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentReport = async () => {
    try {
      setLoading(true);
      setActiveReport('payments');
      const response = await apiService.admin.getPaymentLogs(dateRange.from_date, dateRange.to_date);
      setReportData(response);
      showToast('Payment report generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate payment report:', error);
      showToast('Failed to generate payment report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateStudentReport = async () => {
    try {
      setLoading(true);
      setActiveReport('students');
      const response = await apiService.admin.getStudentLogs();
      setReportData(response);
      showToast('Student activity report generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate student report:', error);
      showToast('Failed to generate student report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceReport = async () => {
    try {
      setLoading(true);
      setActiveReport('attendance');
      const response = await apiService.admin.getAttendanceLogs(dateRange.from_date, dateRange.to_date);
      setReportData(response);
      showToast('Attendance report generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate attendance report:', error);
      showToast('Failed to generate attendance report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (activeReport) {
      case 'mess-cuts':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Mess Cut Report</h3>
            <div className="space-y-3">
              {reportData.mess_cuts?.map((cut, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{cut.student_name}</p>
                      <p className="text-sm text-gray-600">Mess No: {cut.mess_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{cut.from_date} to {cut.to_date}</p>
                      <p className="text-sm text-gray-600">{cut.total_days} days</p>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No mess cuts found for selected period</p>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Payment Report</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-green-600">Total Paid</p>
                <p className="text-xl font-bold text-green-700">
                  ₹{(reportData.total_paid || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-sm text-red-600">Total Pending</p>
                <p className="text-xl font-bold text-red-700">
                  ₹{(reportData.total_pending || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {reportData.payments?.map((payment, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{payment.student_name}</p>
                      <p className="text-sm text-gray-600">Mess No: {payment.mess_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{payment.amount}</p>
                      <p className={`text-sm ${
                        payment.status === 'paid' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No payment data found</p>
              )}
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Active Students Report</h3>
            <div className="space-y-3">
              {reportData.students?.map((student, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">Mess No: {student.mess_no}</p>
                      <p className="text-sm text-gray-600">{student.course} - Year {student.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Room: {student.room_number}</p>
                      <p className={`text-sm ${
                        student.is_approved ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {student.is_approved ? 'Active' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No active students found</p>
              )}
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Attendance Report</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-blue-600">Total Present</p>
                <p className="text-xl font-bold text-blue-700">
                  {reportData.total_present || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-xl font-bold text-gray-700">
                  {reportData.total_students || 0}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-green-600">Attendance %</p>
                <p className="text-xl font-bold text-green-700">
                  {reportData.attendance_percentage || 0}%
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {reportData.attendance?.map((record, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{record.student_name}</p>
                      <p className="text-sm text-gray-600">Mess No: {record.mess_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{record.meal_type}</p>
                      <p className="text-sm text-green-600">Present</p>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No attendance records found</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Generate and view system reports</p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-3">Date Range</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, from_date: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, to_date: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

        {/* Report Generation Buttons */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="grid grid-cols-2 gap-4">
        <button
          onClick={generateMessCutReport}
          disabled={loading}
          className="bg-orange-50 text-orange-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors border border-orange-200 disabled:opacity-50"
        >
          <ScissorsIcon className="w-5 h-5" />
          Mess Cut Logs
        </button>

        <button
          onClick={generatePaymentReport}
          disabled={loading}
          className="bg-green-50 text-green-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50"
        >
          <CurrencyRupeeIcon className="w-5 h-5" />
          Payment Logs
        </button>

        <button
          onClick={generateStudentReport}
          disabled={loading}
          className="bg-blue-50 text-blue-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
        >
          <UsersIcon className="w-5 h-5" />
          Student Activity
        </button>

        <button
          onClick={generateAttendanceReport}
          disabled={loading}
          className="bg-purple-50 text-purple-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors border border-purple-200 disabled:opacity-50"
        >
          <ClockIcon className="w-5 h-5" />
          Attendance Logs
        </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <LoadingSpinner text="Generating report..." />
          </div>
        )}

        {/* Report Data */}
        {!loading && reportData && renderReportData()}
      </div>
    </div>
  );
};

export default AdminReports;
