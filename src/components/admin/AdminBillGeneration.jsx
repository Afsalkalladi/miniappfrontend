import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import PageHeader from './bills/PageHeader';
import BillGenerationForm from './bills/BillGenerationForm';
import BillGenerationResult from './bills/BillGenerationResult';
import RecentBillsList from './bills/RecentBillsList';

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

  const handleParamChange = (field, value) => {
    setGenerationParams(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      <PageHeader 
        title="Bill Generation"
        subtitle="Generate monthly bills for students"
        onBack={onBack}
      />

      <BillGenerationForm
        generationParams={generationParams}
        onParamChange={handleParamChange}
        onGenerate={handleGenerateBills}
        loading={loading}
        error={error}
      />

      <BillGenerationResult result={generationResult} />

      <RecentBillsList 
        bills={recentBills}
        onPublishBills={handlePublishBills}
      />
    </div>
  );
};

export default AdminBillGeneration;
