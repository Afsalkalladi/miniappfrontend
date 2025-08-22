import React from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../common/ui';

const StudentCard = ({ 
  student, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="p-4 hover:bg-telegram-bg/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="w-12 h-12 bg-telegram-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {student.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          
          {/* Student Info */}
          <div>
            <h4 className="text-telegram-text font-medium">{student.name}</h4>
            <div className="flex items-center gap-4 text-sm text-telegram-hint">
              <span>Mess: {student.mess_no}</span>
              <span>{student.department}</span>
              <span>Year: {student.year_of_study}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {student.is_approved ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">
                  <CheckCircleIcon className="w-3 h-3" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs">
                  <XCircleIcon className="w-3 h-3" />
                  Pending
                </span>
              )}
              {student.is_sahara_inmate && (
                <span className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded-full text-xs">
                  Sahara
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {!student.is_approved && (
            <Button
              size="sm"
              variant="success"
              onClick={() => onApprove(student.id)}
              title="Approve Student"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </Button>
          )}
          
          {student.is_approved && (
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600"
              onClick={() => onReject(student.id)}
              title="Reject Student"
            >
              <XCircleIcon className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => onEdit(student)}
            title="Edit Student"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(student.id)}
            title="Delete Student"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-gray-600 text-sm text-telegram-hint">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>Mobile: {student.mobile_number || 'N/A'}</div>
          <div>Room: {student.room_no || 'N/A'}</div>
          <div>Telegram: @{student.telegram_username || 'N/A'}</div>
          <div>Joined: {new Date(student.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
