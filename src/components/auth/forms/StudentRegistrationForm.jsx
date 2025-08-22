import React, { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { Card, FormField, Input, Select, Checkbox, Button, Alert } from '../../common/ui';
import { validateForm, validationRules } from '../../../utils/validation';

const StudentRegistrationForm = ({ onRegister, loading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    room_no: '',
    department: '',
    year_of_study: '',
    is_sahara_inmate: false,
    has_claim: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, validationRules.student);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setValidationErrors({});
    onRegister(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlusIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-telegram-text mb-2">Student Registration</h2>
        <p className="text-telegram-hint">Create your mess account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField 
          label="Full Name" 
          required
          error={validationErrors.name}
        >
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            error={!!validationErrors.name}
            required
          />
        </FormField>

        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">📋 Mess Number</h4>
          <p className="text-blue-300 text-sm">
            Your mess number will be automatically generated after registration approval.
          </p>
        </div>

        <FormField 
          label="Mobile Number" 
          required
          error={validationErrors.mobile_number}
        >
          <Input
            type="tel"
            value={formData.mobile_number}
            onChange={(e) => handleChange('mobile_number', e.target.value)}
            placeholder="Enter your mobile number"
            error={!!validationErrors.mobile_number}
            required
          />
        </FormField>

        {formData.is_sahara_inmate && (
          <FormField 
            label="Room Number" 
            required
            error={validationErrors.room_no}
          >
            <Input
              value={formData.room_no}
              onChange={(e) => handleChange('room_no', e.target.value)}
              placeholder="Enter your room number"
              error={!!validationErrors.room_no}
              required
            />
          </FormField>
        )}

        <FormField 
          label="Department" 
          required
          error={validationErrors.department}
        >
          <Select
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            error={!!validationErrors.department}
            required
          >
            <option value="">Select Department</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics & Communication</option>
            <option value="ME">Mechanical Engineering</option>
            <option value="EEE">Electrical Engineering</option>
            <option value="IT">Information Technology</option>
          </Select>
        </FormField>

        <FormField 
          label="Year of Study" 
          required
          error={validationErrors.year_of_study}
        >
          <Select
            value={formData.year_of_study}
            onChange={(e) => handleChange('year_of_study', e.target.value)}
            error={!!validationErrors.year_of_study}
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </Select>
        </FormField>

        <Checkbox
          label="I am a Sahara inmate/guest"
          checked={formData.is_sahara_inmate}
          onChange={(e) => handleChange('is_sahara_inmate', e.target.checked)}
        />

        <Checkbox
          label="Does he have claim?"
          checked={formData.has_claim}
          onChange={(e) => handleChange('has_claim', e.target.checked)}
        />

        {error && (
          <Alert type="error" message={error} />
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          Register
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-telegram-hint text-sm">
          Already have an account? Use the login option.
        </p>
      </div>
    </Card>
  );
};

export default StudentRegistrationForm;
