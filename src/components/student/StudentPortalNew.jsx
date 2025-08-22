import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { showError, showSuccess } from '../../utils/errorHandler';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentPortal = () => {
  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [messCuts, setMessCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMessCutModal, setShowMessCutModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [profileData, billsData, messCutsData] = await Promise.all([
        apiService.student.getProfile(),
        apiService.student.getBills(),
        apiService.student.getMyMessCuts()
      ]);
      
      setProfile(profileData);
      setBills(billsData.bills || []);
      setMessCuts(messCutsData);
    } catch (error) {
      showError('Failed to load student data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmission = async (billId, transactionNumber, paymentMethod) => {
    try {
      await apiService.student.submitPayment(billId, transactionNumber, paymentMethod);
      showSuccess('Payment submitted successfully');
      setShowPaymentModal(false);
      setSelectedBill(null);
      loadStudentData(); // Refresh data
    } catch (error) {
      showError('Failed to submit payment', error.message);
    }
  };

  const handleMessCutApplication = async (fromDate, toDate, reason) => {
    try {
      await apiService.student.applyMessCut(fromDate, toDate, reason);
      showSuccess('Mess cut application submitted successfully');
      setShowMessCutModal(false);
      loadStudentData(); // Refresh data
    } catch (error) {
      showError('Failed to apply for mess cut', error.message);
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
              <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-gray-600">Welcome, {profile?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Mess No: {profile?.mess_no}</p>
              <p className="text-sm text-gray-600">
                Status: <span className={`font-semibold ${profile?.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile?.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        <div id="error-container" style={{ display: 'none' }}></div>
        <div id="success-container" style={{ display: 'none' }}></div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'profile', name: 'Profile', icon: '👤' },
                { id: 'bills', name: 'Bills & Payments', icon: '💳' },
                { id: 'mess-cuts', name: 'Mess Cuts', icon: '📅' }
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
            {/* Profile Tab */}
            {activeTab === 'profile' && profile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold">{profile.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mess Number:</span>
                        <span className="font-semibold">{profile.mess_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-semibold">{profile.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year of Study:</span>
                        <span className="font-semibold">{profile.year_of_study}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile Number:</span>
                        <span className="font-semibold">{profile.mobile_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Number:</span>
                        <span className="font-semibold">{profile.room_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sahara Inmate:</span>
                        <span className="font-semibold">{profile.is_sahara_inmate ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
                    <div className="text-center">
                      {profile.qr_code_url ? (
                        <img
                          src={profile.qr_code_url}
                          alt="Student QR Code"
                          className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
                        />
                      ) : (
                        <div className="w-48 h-48 mx-auto bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">QR Code not available</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Show this QR code for attendance marking
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-semibold">{profile.user_info?.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telegram Username:</span>
                      <span className="font-semibold">@{profile.user_info?.telegram_username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status:</span>
                      <span className={`font-semibold ${profile.user_info?.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                        {profile.user_info?.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Has Claim:</span>
                      <span className={`font-semibold ${profile.has_claim ? 'text-green-600' : 'text-gray-600'}`}>
                        {profile.has_claim ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bills Tab */}
            {activeTab === 'bills' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bills & Payments</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Generated Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bills.map((bill) => (
                        <tr key={bill.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(bill.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{bill.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              bill.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : bill.status === 'payment_submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {bill.status === 'paid' ? 'Paid' : 
                               bill.status === 'payment_submitted' ? 'Payment Submitted' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(bill.generated_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {bill.status === 'unpaid' && (
                              <button
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowPaymentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Submit Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bills.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No bills available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mess Cuts Tab */}
            {activeTab === 'mess-cuts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Mess Cut Applications</h3>
                  <button
                    onClick={() => setShowMessCutModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply for Mess Cut
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messCuts.map((messCut) => (
                        <tr key={messCut.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(messCut.from_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(messCut.to_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {messCut.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              messCut.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : messCut.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {messCut.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(messCut.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {messCuts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No mess cut applications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onSubmit={handlePaymentSubmission}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
        />
      )}

      {/* Mess Cut Modal */}
      {showMessCutModal && (
        <MessCutModal
          onSubmit={handleMessCutApplication}
          onClose={() => setShowMessCutModal(false)}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ bill, onSubmit, onClose }) => {
  const [transactionNumber, setTransactionNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionNumber.trim()) {
      showError('Please enter transaction number');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(bill.id, transactionNumber, paymentMethod);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Payment</h3>
          
          <div className="bill-details mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Bill Details</h4>
            <p>Month: <span className="font-semibold">{new Date(bill.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span></p>
            <p>Amount: <span className="font-semibold">₹{bill.amount?.toLocaleString()}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID/Reference Number *
              </label>
              <input
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Card">Debit/Credit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Payment'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Mess Cut Modal Component
const MessCutModal = ({ onSubmit, onClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      showError('Please fill all required fields');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showError('From date cannot be later than to date');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(fromDate, toDate, reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for Mess Cut</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date *
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date *
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                placeholder="Please provide reason for mess cut"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="quota-info bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">Monthly Quota: 10 days remaining</p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Applying...' : 'Apply for Mess Cut'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
