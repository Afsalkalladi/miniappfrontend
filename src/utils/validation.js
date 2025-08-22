// Form validation utilities based on the comprehensive guide

export const validationRules = {
  // Student form validation rules
  student: {
    name: {
      required: true,
      label: 'Name',
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name must contain only letters and spaces'
    },
    mobile_number: {
      required: true,
      label: 'Mobile Number',
      pattern: /^[6-9]\d{9}$/,
      message: 'Enter valid 10-digit mobile number'
    },
    room_no: {
      required: false,
      label: 'Room Number',
      minLength: 1,
      validate: (value, formData) => {
        if (formData.is_sahara_inmate && (!value || value.trim() === '')) {
          return 'Room number is required for Sahara inmates/guests';
        }
        return null;
      }
    },
    department: {
      required: true,
      label: 'Department'
    },
    year_of_study: {
      required: true,
      label: 'Year of Study'
    }
  },

  // Payment form validation rules
  payment: {
    transaction_number: {
      required: true,
      label: 'Transaction Number',
      minLength: 6,
      pattern: /^[a-zA-Z0-9]+$/,
      message: 'Transaction number must be alphanumeric and at least 6 characters'
    },
    payment_method: {
      required: true,
      label: 'Payment Method'
    }
  },

  // Bill generation validation rules
  billGeneration: {
    month: {
      required: true,
      label: 'Month'
    },
    per_day_charge: {
      required: true,
      label: 'Per Day Charge',
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Enter valid amount (up to 2 decimal places)'
    },
    establishment_charge: {
      required: true,
      label: 'Establishment Charge',
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Enter valid amount (up to 2 decimal places)'
    }
  },

  // Mess cut validation rules
  messCut: {
    from_date: {
      required: true,
      label: 'From Date'
    },
    to_date: {
      required: true,
      label: 'To Date'
    },
    reason: {
      required: true,
      label: 'Reason',
      minLength: 10,
      message: 'Reason must be at least 10 characters'
    }
  }
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    // Required field validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rule.label} is required`;
      continue;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      continue;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `Invalid ${rule.label}`;
      continue;
    }
    
    // Minimum length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors[field] = `${rule.label} must be at least ${rule.minLength} characters`;
      continue;
    }
    
    // Maximum length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors[field] = `${rule.label} must be no more than ${rule.maxLength} characters`;
      continue;
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value, formData);
      if (customError) {
        errors[field] = customError;
        continue;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific validation functions
export const validateDateRange = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const today = new Date();
  
  if (from < today) {
    return 'From date cannot be in the past';
  }
  
  if (to < from) {
    return 'To date must be after from date';
  }
  
  const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    return 'Mess cut period cannot exceed 30 days';
  }
  
  return null;
};

export const validateMessNumber = (messNo) => {
  if (!messNo) return 'Mess number is required';
  if (!/^\d{7}$/.test(messNo)) return 'Mess number must be 7 digits';
  return null;
};

export const validateMobileNumber = (mobile) => {
  if (!mobile) return 'Mobile number is required';
  if (!/^[6-9]\d{9}$/.test(mobile)) return 'Enter valid 10-digit mobile number starting with 6-9';
  return null;
};

export const validateAmount = (amount) => {
  if (!amount) return 'Amount is required';
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return 'Enter valid amount (up to 2 decimal places)';
  if (parseFloat(amount) <= 0) return 'Amount must be greater than 0';
  return null;
};

// Real-time validation hook
export const useFormValidation = (initialData, rules) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  
  const validateField = (field, value) => {
    const rule = rules[field];
    if (!rule) return null;
    
    const tempData = { ...formData, [field]: value };
    const validation = validateForm({ [field]: value }, { [field]: rule });
    return validation.errors[field] || null;
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const validateAll = () => {
    const validation = validateForm(formData, rules);
    setErrors(validation.errors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return validation;
  };
  
  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: Object.keys(errors).length === 0
  };
};
