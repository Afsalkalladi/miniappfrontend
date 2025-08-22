import React, { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { Card, FormField, Input, Button, Alert } from '../../common/ui';
import { validateForm, validationRules } from '../../../utils/validation';

const LoginForm = ({ onLogin, loading, error }) => {
  const [telegramId, setTelegramId] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const loginRules = {
    telegram_id: {
      required: true,
      label: 'Telegram ID',
      pattern: /^\d+$/,
      message: 'Telegram ID must contain only numbers'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = { telegram_id: telegramId };
    const validation = validateForm(formData, loginRules);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setValidationErrors({});
    onLogin(telegramId);
  };

  const handleTelegramIdChange = (e) => {
    const value = e.target.value;
    setTelegramId(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.telegram_id) {
      setValidationErrors(prev => ({ ...prev, telegram_id: null }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-telegram-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-telegram-text mb-2">Welcome Back</h2>
        <p className="text-telegram-hint">Enter your Telegram ID to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField 
          label="Telegram ID" 
          required
          error={validationErrors.telegram_id}
        >
          <Input
            type="text"
            value={telegramId}
            onChange={handleTelegramIdChange}
            placeholder="Enter your Telegram ID"
            error={!!validationErrors.telegram_id}
            required
          />
          <p className="text-telegram-hint text-xs mt-1">
            💡 You can find your Telegram ID by messaging @userinfobot
          </p>
        </FormField>

        {error && (
          <Alert type="error" message={error} />
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-telegram-hint text-sm">
          Don't have an account? Contact your mess administrator.
        </p>
      </div>
    </Card>
  );
};

export default LoginForm;
