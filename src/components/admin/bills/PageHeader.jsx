import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../common/ui';

const PageHeader = ({ title, subtitle, onBack }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {onBack && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        />
      )}
      <div>
        <h1 className="text-2xl font-bold text-telegram-text">{title}</h1>
        {subtitle && <p className="text-telegram-hint">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
