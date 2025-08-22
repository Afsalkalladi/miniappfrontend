import React from 'react';
import { CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { Card, FormField, Input, Checkbox } from '../../common/ui';

const BillGenerationForm = ({ 
  generationParams, 
  onParamChange, 
  onGenerate, 
  loading, 
  error 
}) => {
  const handleInputChange = (field, value) => {
    onParamChange(field, value);
  };

  const calculateEstimatedTotal = () => {
    return (
      parseFloat(generationParams.per_day_charge) * 30 +
      parseFloat(generationParams.establishment_charge) +
      parseFloat(generationParams.feast_charge) +
      parseFloat(generationParams.special_charge)
    ).toFixed(2);
  };

  return (
    <Card className="mb-6">
      <h3 className="text-lg font-semibold text-telegram-text mb-4">Generate New Bills</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField 
          label="Month" 
          icon={<CalendarIcon className="w-4 h-4" />}
        >
          <Input
            type="month"
            value={generationParams.month}
            onChange={(e) => handleInputChange('month', e.target.value)}
          />
        </FormField>

        <FormField 
          label="Per Day Charge (₹)" 
          icon={<CurrencyRupeeIcon className="w-4 h-4" />}
        >
          <Input
            type="number"
            value={generationParams.per_day_charge}
            onChange={(e) => handleInputChange('per_day_charge', e.target.value)}
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label="Establishment Charge (₹)">
          <Input
            type="number"
            value={generationParams.establishment_charge}
            onChange={(e) => handleInputChange('establishment_charge', e.target.value)}
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label="Feast Charge (₹)">
          <Input
            type="number"
            value={generationParams.feast_charge}
            onChange={(e) => handleInputChange('feast_charge', e.target.value)}
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label="Special Charge (₹)">
          <Input
            type="number"
            value={generationParams.special_charge}
            onChange={(e) => handleInputChange('special_charge', e.target.value)}
            min="0"
            step="0.01"
          />
        </FormField>
      </div>

      <div className="space-y-3 mb-6">
        <Checkbox
          label="Include Sahara Hostel Inmates"
          checked={generationParams.include_sahara_inmates}
          onChange={(e) => handleInputChange('include_sahara_inmates', e.target.checked)}
        />

        <Checkbox
          label="Include Approved Students Only"
          checked={generationParams.include_approved_only}
          onChange={(e) => handleInputChange('include_approved_only', e.target.checked)}
        />

        <Checkbox
          label="Auto-publish bills after generation"
          checked={generationParams.auto_publish}
          onChange={(e) => handleInputChange('auto_publish', e.target.checked)}
        />
      </div>

      {/* Bill Preview */}
      <Card variant="default" className="bg-telegram-bg mb-6">
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
            <span className="text-telegram-accent">₹{calculateEstimatedTotal()}</span>
          </div>
        </div>
      </Card>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/20 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-telegram-accent text-white py-3 rounded-lg hover:bg-telegram-accent/80 disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <span>Generate Bills</span>
        )}
      </button>
    </Card>
  );
};

export default BillGenerationForm;
