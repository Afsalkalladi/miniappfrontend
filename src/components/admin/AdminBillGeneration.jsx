import React, { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const AdminBillGeneration = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationParams, setGenerationParams] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    per_day_charge: '120',
    establishment_charge: '50',
    feast_charge: '0',
    special_charge: '0',
    include_sahara_inmates: true,
    include_approved_only: true,
    auto_publish: false
  });
  const [generationResult, setGenerationResult] = useState(null);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    loadRecentBills();
  }, []);

  const loadRecentBills = async () => {
    try {
      const response = await apiService.admin.getRecentBills({ limit: 10 });
      setRecentBills(response.data.bills || []);
    } catch (error) {
      console.error('Failed to load recent bills:', error);
    }
  };

  const handleGenerateBills = async () => {
    try {
      if (!confirm(`Generate bills for ${generationParams.month}?\n\nThis will create bills for all eligible students.`)) {
        return;
      }

      setLoading(true);
      setError(null);
      setGenerationResult(null);

      // Calculate total mess days for the month
      const [year, month] = generationParams.month.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      const billData = {
        ...generationParams,
        total_mess_days: daysInMonth
      };

      const response = await apiService.admin.generateBills(billData);
      setGenerationResult(response.data);
      
      alert(`✅ Bills generated successfully!\n\nGenerated: ${response.data.generated_count} bills\nTotal Amount: ₹${response.data.total_amount}`);
      
      loadRecentBills();
    } catch (error) {
      console.error('Failed to generate bills:', error);
      setError(error.response?.data?.error || 'Failed to generate bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishBills = async (month) => {
    try {
      if (!confirm(`Publish all bills for ${month}?\n\nStudents will be able to see and pay their bills.`)) {
        return;
      }

      await apiService.admin.publishBills({ month });
      alert('✅ Bills published successfully!');
      loadRecentBills();
    } catch (error) {
      console.error('Failed to publish bills:', error);
      alert(`Failed to publish bills: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleInputChange = (field, value) => {
    setGenerationParams(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
        >
          <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-telegram-text">Bill Generation</h1>
          <p className="text-telegram-hint">Generate monthly bills for students</p>
        </div>
      </div>

      {/* Bill Generation Form */}
      <div className="bg-telegram-secondary rounded-lg p-6 border border-gray-600 mb-6">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Generate New Bills</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Month Selection */}
          <div>
            <label className="block text-telegram-text mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Month
            </label>
            <input
              type="month"
              value={generationParams.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            />
          </div>

          {/* Per Day Charge */}
          <div>
            <label className="block text-telegram-text mb-2">
              <CurrencyRupeeIcon className="w-4 h-4 inline mr-2" />
              Per Day Charge (₹)
            </label>
            <input
              type="number"
              value={generationParams.per_day_charge}
              onChange={(e) => handleInputChange('per_day_charge', e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            />
          </div>

          {/* Establishment Charge */}
          <div>
            <label className="block text-telegram-text mb-2">
              Establishment Charge (₹)
            </label>
            <input
              type="number"
              value={generationParams.establishment_charge}
              onChange={(e) => handleInputChange('establishment_charge', e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            />
          </div>

          {/* Feast Charge */}
          <div>
            <label className="block text-telegram-text mb-2">
              Feast Charge (₹)
            </label>
            <input
              type="number"
              value={generationParams.feast_charge}
              onChange={(e) => handleInputChange('feast_charge', e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            />
          </div>

          {/* Special Charge */}
          <div>
            <label className="block text-telegram-text mb-2">
              Special Charge (₹)
            </label>
            <input
              type="number"
              value={generationParams.special_charge}
              onChange={(e) => handleInputChange('special_charge', e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-telegram-bg border border-gray-600 rounded-lg px-4 py-3 text-telegram-text"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={generationParams.include_sahara_inmates}
              onChange={(e) => handleInputChange('include_sahara_inmates', e.target.checked)}
              className="rounded"
            />
            <span className="text-telegram-text">Include Sahara Hostel Inmates</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={generationParams.include_approved_only}
              onChange={(e) => handleInputChange('include_approved_only', e.target.checked)}
              className="rounded"
            />
            <span className="text-telegram-text">Include Approved Students Only</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={generationParams.auto_publish}
              onChange={(e) => handleInputChange('auto_publish', e.target.checked)}
              className="rounded"
            />
            <span className="text-telegram-text">Auto-publish bills after generation</span>
          </label>
        </div>

        {/* Bill Preview */}
        <div className="bg-telegram-bg rounded-lg p-4 border border-gray-600 mb-6">
          <h4 className="text-telegram-text font-medium mb-3">Bill Preview (30 days)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-telegram-hint">Per Day Charge × 30 days:</span>
              <span className="text-telegram-text">₹{(parseFloat(generationParams.per_day_charge) * 30).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-telegram-hint">Establishment Charge:</span>
              <span className="text-telegram-text">₹{parseFloat(generationParams.establishment_charge).toFixed(2)}</span>
            </div>
            {parseFloat(generationParams.feast_charge) > 0 && (
              <div className="flex justify-between">
                <span className="text-telegram-hint">Feast Charge:</span>
                <span className="text-telegram-text">₹{parseFloat(generationParams.feast_charge).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(generationParams.special_charge) > 0 && (
              <div className="flex justify-between">
                <span className="text-telegram-hint">Special Charge:</span>
                <span className="text-telegram-text">₹{parseFloat(generationParams.special_charge).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-600 pt-2 flex justify-between font-medium">
              <span className="text-telegram-text">Estimated Total:</span>
              <span className="text-telegram-accent">
                ₹{(
                  parseFloat(generationParams.per_day_charge) * 30 +
                  parseFloat(generationParams.establishment_charge) +
                  parseFloat(generationParams.feast_charge) +
                  parseFloat(generationParams.special_charge)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/20 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateBills}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-telegram-accent text-white py-3 rounded-lg hover:bg-telegram-accent/80 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
          {loading ? 'Generating Bills...' : 'Generate Bills'}
        </button>
      </div>

      {/* Generation Result */}
      {generationResult && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Bills Generated Successfully!</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-green-300">Generated Bills</div>
              <div className="text-white font-bold text-lg">{generationResult.generated_count}</div>
            </div>
            <div>
              <div className="text-green-300">Total Amount</div>
              <div className="text-white font-bold text-lg">₹{generationResult.total_amount}</div>
            </div>
            <div>
              <div className="text-green-300">Average Bill</div>
              <div className="text-white font-bold text-lg">
                ₹{(generationResult.total_amount / generationResult.generated_count).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-green-300">Status</div>
              <div className="text-white font-bold text-lg">
                {generationResult.published ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bills */}
      <div className="bg-telegram-secondary rounded-lg border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Recent Bill Generations</h3>
        </div>
        
        {recentBills.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {recentBills.map((bill, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-telegram-text font-medium">
                      {new Date(bill.month).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </h4>
                    <div className="text-telegram-hint text-sm">
                      {bill.total_bills} bills • ₹{bill.total_amount} total
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {bill.is_published ? (
                      <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">
                        Published
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePublishBills(bill.month)}
                        className="px-3 py-1 bg-telegram-accent text-white rounded-full text-sm hover:bg-telegram-accent/80"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h4 className="text-telegram-text font-medium mb-2">No Bills Generated</h4>
            <p className="text-telegram-hint">Generate your first batch of bills above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBillGeneration;
