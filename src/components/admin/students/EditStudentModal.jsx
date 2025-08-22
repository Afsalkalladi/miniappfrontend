import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Card, FormField, Input, Select, Checkbox, Button, Alert } from '../../common/ui';
import { apiService } from '../../../services/apiService';

const EditStudentModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: student.name || '',
    mess_no: student.mess_no || '',
    mobile_number: student.mobile_number || '',
    room_no: student.room_no || '',
    department: student.department || '',
    year_of_study: student.year_of_study || '',
    is_sahara_inmate: student.is_sahara_inmate || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      await apiService.admin.updateStudent(student.id, formData);
      alert('✅ Student updated successfully!');
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">Edit Student</h3>
          <button 
            onClick={onClose} 
            className="text-telegram-hint hover:text-telegram-text p-1 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter student's full name"
              required
            />
          </FormField>

          <FormField label="Mess Number" required>
            <Input
              value={formData.mess_no}
              onChange={(e) => handleChange('mess_no', e.target.value)}
              placeholder="Enter mess number"
              required
            />
          </FormField>

          <FormField label="Mobile Number" required>
            <Input
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => handleChange('mobile_number', e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </FormField>

          <FormField label="Room Number" required>
            <Input
              value={formData.room_no}
              onChange={(e) => handleChange('room_no', e.target.value)}
              placeholder="Enter room number"
              required
            />
          </FormField>

          <FormField label="Department" required>
            <Select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
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

          <FormField label="Year of Study" required>
            <Select
              value={formData.year_of_study}
              onChange={(e) => handleChange('year_of_study', e.target.value)}
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
            label="Sahara Hostel Inmate"
            checked={formData.is_sahara_inmate}
            onChange={(e) => handleChange('is_sahara_inmate', e.target.checked)}
          />

          {error && (
            <Alert type="error" message={error} />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Update Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditStudentModal;
