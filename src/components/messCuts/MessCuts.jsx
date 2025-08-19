import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiService } from '../../services/apiService';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';
import MessCutModal from './MessCutModal';

const MessCuts = () => {
  const [messCuts, setMessCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMessCuts();
  }, []);

  const loadMessCuts = async () => {
    try {
      const response = await apiService.messCuts.getMyCuts();
      setMessCuts(response.data.mess_cuts || []);
    } catch (error) {
      console.error('Failed to load mess cuts:', error);
      setMessCuts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-telegram-secondary h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-telegram-text mb-2">Mess Cuts</h1>
        <p className="text-telegram-hint">Apply for mess leave and view history</p>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full btn-primary mb-6 flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Apply for Mess Cut
      </button>

      {/* Mess Cuts List */}
      <div className="space-y-4">
        {messCuts.map((cut) => (
          <div key={cut.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-telegram-hint" />
                <span className="text-telegram-text font-medium">
                  {format(new Date(cut.from_date), 'MMM dd')} - {format(new Date(cut.to_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cut.status)}`}>
                {cut.status.toUpperCase()}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-telegram-hint text-sm mb-1">Reason</p>
              <p className="text-telegram-text">{cut.reason}</p>
            </div>

            <div className="flex justify-between text-sm text-telegram-hint">
              <span>Applied: {format(new Date(cut.applied_at), 'MMM dd, yyyy')}</span>
              {cut.processed_at && (
                <span>Processed: {format(new Date(cut.processed_at), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        ))}

        {messCuts.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-telegram-hint mx-auto mb-4" />
            <h3 className="text-telegram-text text-lg font-medium mb-2">No Mess Cuts</h3>
            <p className="text-telegram-hint">You haven't applied for any mess cuts yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <MessCutModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadMessCuts();
          }}
        />
      )}
    </div>
  );
};

export default MessCuts;
