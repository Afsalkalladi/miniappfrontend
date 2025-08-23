import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/apiService';
import SearchAndFilters from './students/SearchAndFilters';
import StudentsList from './students/StudentsList';
import Pagination from './students/Pagination';
import AddStudentModal from './students/AddStudentModal';
import EditStudentModal from './students/EditStudentModal';

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

  useEffect(() => {
    // Check if we should filter to pending students from navigation
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('filter');
    if (filterFromUrl === 'pending') {
      setFilterStatus('pending');
    }
  }, []);

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

  const handleApproveStudent = async (studentId, action = 'approve') => {
    try {
      const student = students.find(s => s.id === studentId);
      
      await apiService.admin.updateStudentStatus(studentId, action);
      
      // Remove student from list if rejected, update if approved
      if (action === 'reject') {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      } else {
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, is_approved: true } : s
        ));
      }
      
      // Show success message
      const message = action === 'approve' 
        ? `Student ${student?.name} approved successfully`
        : `Student ${student?.name} rejected successfully`;
      
      // You can add a toast notification here if available
      console.log(message);
      
    } catch (error) {
      console.error(`Failed to ${action} student:`, error);
      setError(`Failed to ${action} student`);
    }
  };

  const handleRejectStudent = async (studentId) => {
    if (confirm('Are you sure you want to reject this student? This action cannot be undone.')) {
      await handleApproveStudent(studentId, 'reject');
    }
  };

  const handleApproveStudentConfirm = async (studentId) => {
    if (confirm('Are you sure you want to approve this student?')) {
      await handleApproveStudent(studentId, 'approve');
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

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      <StudentsList
        students={filteredStudents}
        onApprove={handleApproveStudent}
        onReject={handleRejectStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

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

export default AdminStudentManagement;
