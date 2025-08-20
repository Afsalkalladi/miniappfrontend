import React, { useState } from 'react';
import { apiService } from '../../services/apiService';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (name, apiCall) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await apiCall();
      setResults(prev => ({
        ...prev,
        [name]: { success: true, data: response.data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: { 
          success: false, 
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'Profile',
      call: () => apiService.auth.getProfile()
    },
    {
      name: 'Current Bill',
      call: () => apiService.bills.getCurrentBill()
    },
    {
      name: 'All Bills',
      call: () => apiService.bills.getAllBills()
    },
    {
      name: 'My Attendance',
      call: () => apiService.attendance.getMyAttendance()
    },
    {
      name: 'My Mess Cuts',
      call: () => apiService.messCuts.getMyCuts()
    },
    {
      name: 'Admin Dashboard Stats',
      call: () => apiService.admin.getDashboardStats()
    },
    {
      name: 'Pending Students',
      call: () => apiService.admin.getPendingStudents()
    }
  ];

  return (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-telegram-text mb-6">🔧 API Test Dashboard</h1>
        
        <div className="mb-6">
          <div className="bg-telegram-secondary p-4 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-telegram-text mb-2">Authentication Status</h3>
            <div className="text-sm">
              <div>Token: {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}</div>
              <div>Base URL: {apiService.defaults?.baseURL || 'Not set'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {tests.map((test) => (
            <div key={test.name} className="bg-telegram-secondary p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-telegram-text">{test.name}</h3>
                <button
                  onClick={() => testEndpoint(test.name, test.call)}
                  disabled={loading[test.name]}
                  className="bg-telegram-accent text-white px-3 py-1 rounded text-sm hover:bg-telegram-accent/80 disabled:opacity-50"
                >
                  {loading[test.name] ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {results[test.name] && (
                <div className="mt-3">
                  {results[test.name].success ? (
                    <div className="text-green-400 text-sm">
                      <div className="font-medium mb-1">✅ Success</div>
                      <pre className="bg-telegram-bg p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(results[test.name].data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">
                      <div className="font-medium mb-1">❌ Error ({results[test.name].status})</div>
                      <pre className="bg-telegram-bg p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(results[test.name].error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-telegram-secondary p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-telegram-text mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setResults({});
                tests.forEach(test => testEndpoint(test.name, test.call));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test All Endpoints
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                setResults({});
                alert('Auth token cleared. Please refresh and login again.');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Auth Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
