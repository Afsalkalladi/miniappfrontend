import React from 'react';
import { CheckCircleIcon, ClockIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const RegistrationFlow = ({ currentStep = 'register' }) => {
  const steps = [
    {
      id: 'register',
      title: 'Register',
      description: 'Fill registration form',
      icon: UserPlusIcon,
    },
    {
      id: 'pending',
      title: 'Pending Approval',
      description: 'Wait for admin approval',
      icon: ClockIcon,
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Access dashboard',
      icon: CheckCircleIcon,
    },
  ];

  const getStepStatus = (stepId) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20 border-green-400';
      case 'current': return 'text-telegram-accent bg-telegram-accent/20 border-telegram-accent';
      case 'upcoming': return 'text-telegram-hint bg-telegram-hint/20 border-telegram-hint';
      default: return 'text-telegram-hint bg-telegram-hint/20 border-telegram-hint';
    }
  };

  return (
    <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
      <h3 className="text-telegram-text font-medium mb-4 text-center">Registration Process</h3>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${getStepColor(status)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    status === 'current' ? 'text-telegram-accent' : 
                    status === 'completed' ? 'text-green-400' : 'text-telegram-hint'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-telegram-hint mt-1">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  status === 'completed' ? 'bg-green-400' : 'bg-telegram-hint/30'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationFlow;
