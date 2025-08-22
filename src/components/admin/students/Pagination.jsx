import React from 'react';
import { Button } from '../../common/ui';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6">
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      <span className="px-4 py-2 bg-telegram-accent text-white rounded-lg">
        {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
