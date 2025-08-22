import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';
import { Card } from '../../common/ui';
import StudentCard from './StudentCard';

const StudentsList = ({ 
  students, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete,
  searchTerm,
  filterStatus 
}) => {
  return (
    <Card>
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-telegram-text">
          Students ({students.length})
        </h3>
      </div>
      
      {students.length > 0 ? (
        <div className="divide-y divide-gray-600">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
          <h4 className="text-telegram-text font-medium mb-2">No Students Found</h4>
          <p className="text-telegram-hint">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No students have registered yet.'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default StudentsList;
