import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';

const AdminStudentManagement = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStudents();
  }, [currentPage, searchTerm, filterStatus]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };

      const response = await apiService.admin.getAllStudents(params);
      setStudents(response.data.results || response.data || []);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 20));
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!confirm(`Approve ${student?.name}?`)) return;

      await apiService.admin.approveStudent(studentId);
      alert(`✅ ${student?.name} approved successfully!`);
      loadStudents();
    } catch (error) {
      console.error('Failed to approve student:', error);
      alert(`Failed to approve student: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!confirm(`Reject ${student?.name}?`)) return;

      await apiService.admin.rejectStudent(studentId);
      alert(`❌ ${student?.name} rejected successfully!`);
      loadStudents();
    } catch (error) {
      console.error('Failed to reject student:', error);
      alert(`Failed to reject student: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!confirm(`⚠️ PERMANENTLY DELETE ${student?.name}?\n\nThis action cannot be undone!`)) return;

      await apiService.admin.deleteStudent(studentId);
      alert(`🗑️ ${student?.name} deleted successfully!`);
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert(`Failed to delete student: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.mess_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'approved' && student.is_approved) ||
                         (filterStatus === 'pending' && !student.is_approved);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Error Loading Students</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button onClick={loadStudents} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-telegram-secondary rounded-lg border border-gray-600"
          >
            <ArrowLeftIcon className="w-5 h-5 text-telegram-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-telegram-text">Student Management</h1>
            <p className="text-telegram-hint">Manage all student accounts</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-telegram-accent text-white px-4 py-2 rounded-lg hover:bg-telegram-accent/80"
        >
          <PlusIcon className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-telegram-secondary rounded-lg p-4 border border-gray-600 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-telegram-hint absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, mess number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-telegram-bg border border-gray-600 rounded-lg text-telegram-text placeholder-telegram-hint"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-telegram-bg border border-gray-600 rounded-lg px-4 py-2 text-telegram-text"
          >
            <option value="all">All Students</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-telegram-secondary rounded-lg border border-gray-600">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text">
            Students ({filteredStudents.length})
          </h3>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-600">
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-4 hover:bg-telegram-bg/50 transition-colors">
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
                      <button
                        onClick={() => handleApproveStudent(student.id)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        title="Approve Student"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    {student.is_approved && (
                      <button
                        onClick={() => handleRejectStudent(student.id)}
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        title="Reject Student"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      title="Edit Student"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Delete Student"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-telegram-secondary border border-gray-600 rounded-lg text-telegram-text disabled:opacity-50"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 bg-telegram-accent text-white rounded-lg">
            {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-telegram-secondary border border-gray-600 rounded-lg text-telegram-text disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadStudents();
          }}
        />
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setEditingStudent(null);
            loadStudents();
          }}
        />
      )}
    </div>
  );
};

// Add Student Modal Component (will be implemented in next step)
const AddStudentModal = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-telegram-secondary rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Add New Student</h3>
        <p className="text-telegram-hint mb-4">Add student functionality coming soon...</p>
        <button onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
};

// Edit Student Modal Component (will be implemented in next step)
const EditStudentModal = ({ student, onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-telegram-secondary rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-telegram-text mb-4">Edit Student</h3>
        <p className="text-telegram-hint mb-4">Editing {student.name}...</p>
        <p className="text-telegram-hint mb-4">Edit functionality coming soon...</p>
        <button onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminStudentManagement;
