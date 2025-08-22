import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Card, Input, Select } from '../../common/ui';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange 
}) => {
  return (
    <Card className="mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-telegram-hint absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by name, mess number, or department..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter */}
        <Select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All Students</option>
          <option value="approved">Approved Only</option>
          <option value="pending">Pending Only</option>
        </Select>
      </div>
    </Card>
  );
};

export default SearchAndFilters;
