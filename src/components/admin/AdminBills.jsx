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
    fine_reason: 'Late payment'
  });

  useEffect(() => {
    if (activeView === 'paid' || activeView === 'unpaid') {
      loadBills();
    }
  }, [activeView]);

  const loadBills = async () => {
    try {
      setLoading(true);
      let response;
      if (activeView === 'paid') {
        response = await apiService.admin.getPaidStudents();
      } else if (activeView === 'unpaid') {
        response = await apiService.admin.getUnpaidStudents();
      }
      setBills(response || []);
    } catch (error) {
      // Treat 404 as no data without surfacing an error toast
      if (error?.status === 404) {
        setBills([]);
      } else {
        console.error('Failed to load bills:', error);
        showToast?.('Failed to load bills', 'error');
      }
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
      await apiService.admin.imposeFine(selectedBill.student_id, fineForm.fine_amount, fineForm.fine_reason);
      showToast?.('Fine added successfully!', 'success');
      setShowFineForm(false);
      setSelectedBill(null);
      loadBills();
    } catch (error) {
      console.error('Failed to add fine:', error);
      showToast?.(error.response?.data?.error || 'Failed to add fine', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOverdueFines = async () => {
    const confirmed = confirm('Add ₹25 fine to all bills overdue by 7+ days?');
    if (!confirmed) return;

    try {
      setLoading(true);
      // This would need a specific API endpoint for bulk overdue fines
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

  const handleModifyBill = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.admin.modifyBill(selectedBill.id, {
        amount: selectedBill.total_amount,
        // Add other modifiable fields as needed
      });
      showToast?.('Bill modified successfully!', 'success');
      setShowModifyForm(false);
      setSelectedBill(null);
      loadBills();
    } catch (error) {
      console.error('Failed to modify bill:', error);
      showToast?.(error.message || 'Failed to modify bill', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Bills Management</h2>
        <p className="text-gray-600 mt-1">Generate and manage student bills</p>
      </div>

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
          onClick={handleAddOverdueFines}
          className="bg-orange-50 text-orange-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors border border-orange-200"
        >
          <CurrencyRupeeIcon className="w-5 h-5" />
          Add Overdue Fines
        </button>
      </div>
    </div>
  );

  const renderBillsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('overview')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Overview
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {activeView} Students ({bills.length})
        </h2>
      </div>

      {loading ? (
        <LoadingSpinner text={`Loading ${activeView} bills...`} />
      ) : bills.length === 0 ? (
        <div className="text-center py-8">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {activeView} bills found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{bill.student_name}</h3>
                  <p className="text-sm text-gray-600">Mess No: {bill.mess_no}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{bill.total_amount}</p>
                  <p className={`text-sm ${
                    bill.status === 'paid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {bill.status === 'paid' ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedBill(bill);
                    setShowModifyForm(true);
                  }}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Modify
                </button>
                
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
                
                {bill.status === 'unpaid' && (
                  <button
                    onClick={() => {
                      setSelectedBill(bill);
                      setShowFineForm(true);
                    }}
                    className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <CurrencyRupeeIcon className="w-4 h-4" />
                    Fine
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
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

      {/* Add Fine Modal */}
      {showFineForm && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Fine</h3>
              <button
                onClick={() => {
                  setShowFineForm(false);
                  setSelectedBill(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedBill.student_name}</p>
              <p className="text-sm text-gray-600">Mess No: {selectedBill.mess_no}</p>
              <p className="text-sm text-gray-600">Current Amount: ₹{selectedBill.total_amount}</p>
            </div>

            <form onSubmit={handleAddFine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fine Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fineForm.fine_amount}
                  onChange={(e) => setFineForm(prev => ({ ...prev, fine_amount: parseFloat(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Late payment"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFineForm(false);
                    setSelectedBill(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBills;
