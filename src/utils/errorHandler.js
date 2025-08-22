// Error handling utilities
export function showError(message, details = null) {
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.innerHTML = `
      <div class="error-alert bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="error-icon text-red-500 text-xl mr-3">⚠️</div>
          <div class="error-content flex-1">
            <h4 class="text-red-800 font-semibold">Error</h4>
            <p class="text-red-700">${message}</p>
            ${details ? `<small class="text-red-600">${details}</small>` : ''}
          </div>
          <button onclick="hideError()" class="error-close text-red-500 hover:text-red-700 ml-2">×</button>
        </div>
      </div>
    `;
    errorContainer.style.display = 'block';
  }
}

export function showSuccess(message) {
  const successContainer = document.getElementById('success-container');
  if (successContainer) {
    successContainer.innerHTML = `
      <div class="success-alert bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <div class="success-icon text-green-500 text-xl mr-3">✅</div>
          <div class="success-content flex-1">
            <p class="text-green-700">${message}</p>
          </div>
          <button onclick="hideSuccess()" class="success-close text-green-500 hover:text-green-700 ml-2">×</button>
        </div>
      </div>
    `;
    successContainer.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(hideSuccess, 3000);
  }
}

export function hideError() {
  const errorContainer = document.getElementById('error-container');
  if (errorContainer) {
    errorContainer.style.display = 'none';
    errorContainer.innerHTML = '';
  }
}

export function hideSuccess() {
  const successContainer = document.getElementById('success-container');
  if (successContainer) {
    successContainer.style.display = 'none';
    successContainer.innerHTML = '';
  }
}

// Form validation utility
export function validateForm(formData, rules) {
  const errors = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${rule.label} is required`;
      continue;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `Invalid ${rule.label}`;
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${rule.label} must be at least ${rule.minLength} characters`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Student form validation rules
export const studentFormRules = {
  name: {
    required: true,
    label: 'Name',
    minLength: 2
  },
  mess_no: {
    required: true,
    label: 'Mess Number',
    pattern: /^\d{7}$/,
    message: 'Mess number must be 7 digits'
  },
  mobile_number: {
    required: true,
    label: 'Mobile Number',
    pattern: /^[6-9]\d{9}$/,
    message: 'Enter valid 10-digit mobile number'
  },
  room_no: {
    required: true,
    label: 'Room Number'
  },
  department: {
    required: true,
    label: 'Department'
  },
  year_of_study: {
    required: true,
    label: 'Year of Study'
  }
};
