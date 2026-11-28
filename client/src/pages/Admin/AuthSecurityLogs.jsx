import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const TOKEN_KEY = 'super_admin_v380_token';
const LOGIN_PATH = '/x9-super-2026';

const AuthSecurityLogs = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAuthLogs = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    try {
      const res = await api.get(`${LOGIN_PATH}/auth-security-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-super-token': token,
        },
      });
      if (res.data?.success) {
        setLogs(res.data.logs || res.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate(LOGIN_PATH, { replace: true });
      } else {
        showToast('Failed to fetch authentication security logs', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    fetchAuthLogs();
  }, [fetchAuthLogs]);

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.status === filterType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-indigo-400 flex items-center justify-center font-mono text-xs">
        LOADING v3.8.0 AUTH SECURITY LOGS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            Authentication & 2FA Security Logs (v3.8.0)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Password + Phone/Gmail 2FA Logins • Transaction PIN Checks • Brute-Force IP Audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
          >
            <option value="ALL">All Events</option>
            <option value="PASS">Passed Only</option>
            <option value="FAIL">Failed / Blocked Only</option>
          </select>

          <button
            type="button"
            onClick={() => navigate(`${LOGIN_PATH}/dashboard`)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Auth Method / Event</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Device / Agent</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No authentication security events recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item, idx) => {
                  const isPass = item.status === 'PASS';
                  return (
                    <tr key={item._id || idx} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white">
                        {item.eventType || 'PASSWORD_2FA_LOGIN'}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-cyan-400">
                        {item.ipAddress || 'Unknown'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">
                        {item.userAgent || 'Enterprise Client'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isPass
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuthSecurityLogs;
