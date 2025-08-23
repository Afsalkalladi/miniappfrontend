import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  PlusIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AdminBills = ({ user, showToast }) => {
  const [activeView, setActiveView] = useState('overview');
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showFineForm, setShowFineForm] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [generateForm, setGenerateForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    total_mess_days: 31,
    per_day_charge: 50.00,
    establishment_charge: 200.00,
    feast_charge: 100.00,
    special_charge: 0.00
  });

  const [fineForm, setFineForm] = useState({
    fine_amount: 50.00,
    fine_reason: 'Late payment',
    days_overdue: 7
  });

  useEffect(() => {
    if (activeView === 'paid' || activeView === 'unpaid') {
      loadBills();
    } else if (activeView === 'pending') {
      loadPendingPayments();
    }
  }, [activeView]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill => 
        bill.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBills(filtered);
    }
  }, [bills, searchQuery]);

  const loadBills = async () => {
    try {
      setLoading(true);
      setBills([]); // Clear existing data first
      let response;
      if (activeView === 'paid') {
        response = await apiService.admin.getPaidStudents();
      } else if (activeView === 'unpaid') {
        response = await apiService.admin.getUnpaidStudents();
      }
      
      // Ensure response is an array and has valid data
      const billsData = Array.isArray(response) ? response : [];
      setBills(billsData);
      
      if (billsData.length === 0) {
        console.log(`No ${activeView} bills found`);
      } else {
        console.log(`Loaded ${billsData.length} ${activeView} bills`);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      setBills([]);
      showToast(`Failed to load ${activeView} bills`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      setPendingPayments([]); // Clear existing data first
      const response = await apiService.admin.getPendingPayments();
      const paymentsData = Array.isArray(response) ? response : [];
      setPendingPayments(paymentsData);
      
      if (paymentsData.length === 0) {
        console.log('No pending payments found');
      } else {
        console.log(`Loaded ${paymentsData.length} pending payments`);
      }
    } catch (error) {
      console.error('Error loading pending payments:', error);
      setPendingPayments([]);
      showToast('Failed to load pending payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Validate total_mess_days against selected month (max days)
      const [year, month] = generateForm.month.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      if (
        !Number.isFinite(generateForm.total_mess_days) ||
        generateForm.total_mess_days < 1 ||
        generateForm.total_mess_days > daysInMonth
      ) {
        showToast(`Total mess days must be between 1 and ${daysInMonth} for ${generateForm.month}.`, 'warning');
        setLoading(false);
        return;
      }
      await apiService.admin.generateBills();
      showToast?.('Bills generated successfully!', 'success');
      setShowGenerateForm(false);
      if (activeView === 'unpaid') {
        loadBills();
      }
    } catch (error) {
      console.error('Failed to generate bills:', error);
      const serverErr = error.response?.data?.error;
      const serializerErr = error.response?.data;
      if (serializerErr?.total_mess_days?.length) {
        showToast?.(serializerErr.total_mess_days[0] || 'Invalid total mess days', 'error');
      } else {
        showToast?.(serverErr || 'Failed to generate bills', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFine = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Only bulk fine for overdue bills
      await apiService.admin.addOverdueFines(fineForm.days_overdue, fineForm.fine_amount, fineForm.fine_reason);
      showToast?.('Bulk fines added successfully!', 'success');
      
      setShowFineForm(false);
      if (activeView === 'unpaid') {
        loadBills();
      }
    } catch (error) {
      console.error('Failed to add fine:', error);
      showToast?.(error.response?.data?.error || 'Failed to add fine', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOverdueFines = async () => {
    try {
      setLoading(true);
      await apiService.admin.addOverdueFines(7, 50, 'Late payment fine - 7 days overdue');
      showToast?.('Overdue fines added successfully!', 'success');
      if (activeView === 'unpaid') {
        loadBills();
      }
    } catch (error) {
      console.error('Failed to add overdue fines:', error);
      showToast?.(error.response?.data?.error || 'Failed to add overdue fines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      setLoading(true);
      await apiService.admin.verifyPayment(paymentId, 'approve');
      showToast?.('Payment approved successfully!', 'success');
      loadPendingPayments();
    } catch (error) {
      console.error('Failed to approve payment:', error);
      showToast?.(error.response?.data?.error || 'Failed to approve payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      setLoading(true);
      await apiService.admin.verifyPayment(paymentId, 'reject');
      showToast?.('Payment rejected successfully!', 'success');
      loadPendingPayments();
    } catch (error) {
      console.error('Failed to reject payment:', error);
      showToast?.(error.response?.data?.error || 'Failed to reject payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyBill = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const data = {
        amount: parseFloat(formData.get('amount')),
        fine_amount: parseFloat(formData.get('fine_amount')) || 0,
        fine_reason: formData.get('fine_reason') || ''
      };
      await apiService.admin.modifyBill(selectedBill.id || selectedBill.bill_id, data);
      showToast?.('Bill modified successfully!', 'success');
      setShowModifyForm(false);
      setSelectedBill(null);
      if (activeView !== 'overview') {
        loadBills();
      }
    } catch (error) {
      console.error('Failed to modify bill:', error);
      showToast?.(error.response?.data?.error || 'Failed to modify bill', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (bill) => {
    try {
      setLoading(true);
      await apiService.admin.modifyBill(bill.id || bill.bill_id, { status: 'paid' });
      showToast?.('Bill marked as paid successfully!', 'success');
      loadBills();
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
      showToast?.(error.response?.data?.error || 'Failed to mark bill as paid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    const confirmed = confirm('Are you sure you want to delete this bill?');
    if (!confirmed) return;

    try {
      setLoading(true);
      await apiService.admin.deleteBill(billId);
      showToast?.('Bill deleted successfully!', 'success');
      loadBills();
    } catch (error) {
      console.error('Failed to delete bill:', error);
      showToast?.(error.message || 'Failed to delete bill', 'error');
    } finally {
      setLoading(false);
    }
  };


  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900">Bills Management</h2>
        <p className="text-gray-600 mt-1">Generate and manage student bills</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setShowGenerateForm(true)}
          className="bg-blue-600 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Generate New Bills
        </button>

        <button
          onClick={() => setActiveView('paid')}
          className="bg-green-50 text-green-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors border border-green-200"
        >
          <CheckCircleIcon className="w-5 h-5" />
          View Paid Students
        </button>

        <button
          onClick={() => setActiveView('unpaid')}
          className="bg-red-50 text-red-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-200"
        >
          <ExclamationTriangleIcon className="w-5 h-5" />
          View Unpaid Students
        </button>

        <button
          onClick={() => setActiveView('pending')}
          className="bg-yellow-50 text-yellow-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-yellow-100 transition-colors border border-yellow-200"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Pending Payments
        </button>

        <button
          onClick={() => setShowFineForm(true)}
          className="bg-orange-50 text-orange-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors border border-orange-200"
        >
          <CurrencyRupeeIcon className="w-5 h-5" />
          Manage Fines
        </button>
        </div>
      </div>
    </div>
  );

  const renderBillsList = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setActiveView('overview')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Overview
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {activeView === 'pending' ? `Pending Payments (${pendingPayments.length})` : `${activeView} Students (${filteredBills.length}/${bills.length})`}
          </h2>
        </div>
        
        {/* Search Bar for Bills */}
        {(activeView === 'paid' || activeView === 'unpaid') && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeView} students...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text={`Loading ${activeView} bills...`} />
      ) : (activeView === 'pending' ? pendingPayments.length === 0 : filteredBills.length === 0) ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {activeView === 'pending' ? 'pending payments' : `${activeView} bills`} found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(activeView === 'pending' ? pendingPayments : filteredBills).map((item) => (
            <div key={item.id || item.bill_id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">{item.name || item.student_name}</span>
                    <span className="text-sm text-gray-500">({item.roll_number || item.mess_no})</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Amount: ₹{item.amount} • Month: {item.month}
                    {activeView === 'pending' && item.transaction_number && (
                      <span className="ml-2">• TXN: {item.transaction_number}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeView === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovePayment(item.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve Payment"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectPayment(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject Payment"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {activeView === 'unpaid' && (
                        <button
                          onClick={() => handleMarkAsPaid(item)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Paid"
                          disabled={loading}
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBill(item);
                          setShowModifyForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modify Bill"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {activeView === 'overview' ? renderOverview() : renderBillsList()}

        {/* Generate Bills Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Bills</h3>
              <button
                onClick={() => setShowGenerateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Mess Days
                  </label>
                  <input
                    type="number"
                    value={generateForm.total_mess_days}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, total_mess_days: parseInt(e.target.value) || 0 }))}
                    min={1}
                    max={(() => { const [y, m] = generateForm.month.split('-').map(Number); return new Date(y, m, 0).getDate(); })()}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Max days this month: {(() => { const [y, m] = generateForm.month.split('-').map(Number); return new Date(y, m, 0).getDate(); })()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Day Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.per_day_charge}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, per_day_charge: parseFloat(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Establishment Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.establishment_charge}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, establishment_charge: parseFloat(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feast Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.feast_charge}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, feast_charge: parseFloat(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Charge (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={generateForm.special_charge}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, special_charge: parseFloat(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Bills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Fine Management Modal */}
    {showFineForm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Add Bulk Fines</h3>
            <button
              onClick={() => setShowFineForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleAddFine} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Overdue
              </label>
              <input
                type="number"
                min="1"
                value={fineForm.days_overdue}
                onChange={(e) => setFineForm(prev => ({ ...prev, days_overdue: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Add fines to bills older than this many days
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fine Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={fineForm.fine_amount}
                onChange={(e) => setFineForm(prev => ({ ...prev, fine_amount: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fine Reason
              </label>
              <input
                type="text"
                value={fineForm.fine_reason}
                onChange={(e) => setFineForm(prev => ({ ...prev, fine_reason: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter fine reason"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowFineForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Bulk Fines'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modify Bill Modal */}
      {showModifyForm && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modify Bill</h3>
              <button
                onClick={() => {
                  setShowModifyForm(false);
                  setSelectedBill(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleModifyBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student: {selectedBill.name || selectedBill.student_name}
                </label>
                <p className="text-sm text-gray-500">Roll: {selectedBill.roll_number || selectedBill.mess_no}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={selectedBill.amount}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fine Amount (₹)
                </label>
                <input
                  type="number"
                  name="fine_amount"
                  step="0.01"
                  defaultValue={selectedBill.fine_amount || 0}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fine Reason
                </label>
                <input
                  type="text"
                  name="fine_reason"
                  defaultValue={selectedBill.fine_reason || ''}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter fine reason"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModifyForm(false);
                    setSelectedBill(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminBills;
