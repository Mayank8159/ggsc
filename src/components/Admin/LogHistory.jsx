import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { FiList, FiTrash2, FiRefreshCw, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function LogHistory() {
  const [logs, setLogs] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [profileNames, setProfileNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch active session user role
    const getRole = async () => {
      // Respect mock session first
      const mockRole = localStorage.getItem('ggsc_mock_role');
      if (mockRole) {
        setUserRole(mockRole);
        return;
      }

      try {
        const data = await apiClient.get('/api/me');
        if (data?.profile) setUserRole(data.profile.role);
      } catch (err) {
        console.warn('Error reading active session role:', err);
      }
    };

    getRole();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch audit logs from login_history
      const logsData = await apiClient.get('/api/login-history');

      // 2. Fetch profiles mapping for Display Names
      const profilesData = await apiClient.get('/api/profiles').catch(() => ({ profiles: [] }));

      const nameMap = {};
      if (profilesData?.profiles) {
        profilesData.profiles.forEach(p => {
          if (p.email) {
            nameMap[p.email.toLowerCase()] = p.display_name;
          }
        });
      }

      setProfileNames(nameMap);
      setLogs(logsData.logs || []);
    } catch (err) {
      console.warn('Database logs error:', err);
      
      // Fallback for local testing mode
      if (!apiClient.getToken()) {
        const mockLogs = [
          { id: '1', email: 'admin@ggsc.org', role: 'admin', status: 'success', logged_at: new Date().toISOString() },
          { id: '2', email: 'oops@ggsc.org', role: 'oops', status: 'success', logged_at: new Date(Date.now() - 60000).toISOString() },
          { id: '3', email: 'intruder@gmail.com', role: 'admin', status: 'failed', logged_at: new Date(Date.now() - 120000).toISOString() }
        ];
        setLogs(mockLogs);
        setProfileNames({
          'admin@ggsc.org': 'Super Admin',
          'oops@ggsc.org': 'Oops Lead'
        });
      } else {
        setError('Failed to retrieve login history. Verify permissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (userRole !== 'oops') {
      alert('Unauthorized. Only Oops team members are permitted to delete login history.');
      return;
    }

    if (!window.confirm('WARNING: Are you sure you want to permanently delete all login history logs? This action cannot be undone.')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      await apiClient.delete('/api/login-history');
      setSuccess('Login history cleared successfully.');
      setLogs([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to clear login logs.');
    }
  };

  const handleDeleteRow = async (id) => {
    if (userRole !== 'oops') return;

    try {
      await apiClient.delete(`/api/login-history/${id}`);
      setLogs(logs.filter(log => log.id !== id));
      setSuccess('Audit log entry deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete audit log entry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Login Audit History
          </h2>
          <p className="text-neutral-500 mt-1">Real-time log of security access attempts inside the admin portal shell.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <FiRefreshCw /> Refresh Logs
          </button>

          {userRole === 'oops' && logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm"
            >
              <FiTrash2 /> Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm rounded-2xl text-red-700 bg-red-50 border border-red-100">
          <FiAlertTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 text-sm rounded-2xl text-green-700 bg-green-50 border border-green-100">
          <FiCheckCircle className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Audit Log Table Card */}
      <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/80 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20 text-neutral-400 text-sm gap-2 items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
            Loading audit entries...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 italic text-sm">
            No login attempts recorded in the audit trail.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/60 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Email ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Success</th>
                  {userRole === 'oops' && <th className="pb-3 pr-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-neutral-100">
                {logs.map((log) => {
                  const emailLower = log.email ? log.email.toLowerCase() : '';
                  const displayName = profileNames[emailLower] || (log.email ? log.email.split('@')[0] : 'Unknown');
                  const logDate = new Date(log.logged_at).toLocaleDateString();
                  const logTime = new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/50 transition-all">
                      <td className="py-3.5 pl-2 font-bold text-neutral-800 capitalize">{displayName}</td>
                      <td className="py-3.5 text-neutral-600 font-mono">{log.email}</td>
                      <td className="py-3.5 text-neutral-500 font-mono">{logDate}</td>
                      <td className="py-3.5 text-neutral-500 font-mono">{logTime}</td>
                      <td className="py-3.5">
                        {log.status === 'success' ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-green-500 inline-block border-2 border-white shadow-sm" title="Success" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block border-2 border-white shadow-sm" title="Failed" />
                        )}
                      </td>
                      {userRole === 'oops' && (
                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => handleDeleteRow(log.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete entry"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
