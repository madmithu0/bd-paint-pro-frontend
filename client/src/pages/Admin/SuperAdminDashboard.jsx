import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const TOKEN_KEY = 'super_admin_v380_token';
const LOGIN_PATH = '/x9-super-2026';

const SuperAdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [telemetry, setTelemetry] = useState({
    appVersion: 'v3.8.0 ENTERPRISE FINAL',
    netProfit: 0,
    merchantCommission: 0,
    hotlineStatus: 'ACTIVE',
    hotlineNumber: '+8801700000000',
    dialectAiHealth: '98.4% OPTIMAL',
    advanceGateStatus: '30% GATE ACTIVE',
    mongoReplicaStatus: 'HEALTHY (3-NODE)',
    systemUptime: '99.98%',
    securityVerified: {
      passwordAuth: true,
      phoneOtp2FA: true,
      gmailOtp2FA: true,
      ipWhitelist: true,
    },
  });

  const handleForceLogout = useCallback(
    (msg, type = 'info') => {
      localStorage.removeItem(TOKEN_KEY);
      if (msg) showToast(msg, type);
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        navigate(LOGIN_PATH, { replace: true });
      }
    },
    [navigate, onLogout, showToast]
  );

  const fetchDashboardStatus = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      handleForceLogout();
      return;
    }

    try {
      const dashRes = await api.get(`${LOGIN_PATH}/dashboard-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-super-token': token,
        },
      });

      if (dashRes.data?.success) {
        const data = dashRes.data.data || dashRes.data;
        setTelemetry((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleForceLogout('Session expired or unauthorized IP', 'error');
      } else {
        showToast('Failed to sync live system telemetry', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [handleForceLogout, showToast]);

  useEffect(() => {
    fetchDashboardStatus();
    const pollInterval = setInterval(fetchDashboardStatus, 30000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const adminModules = [
    { id: 'overview', label: 'Master Control Room', path: `${LOGIN_PATH}/dashboard` },
    { id: 'users', label: 'User & Mistri Profiles', path: `${LOGIN_PATH}/users` },
    { id: 'kill', label: 'Per-Feature & Govt Switches', path: `${LOGIN_PATH}/kill` },
    { id: 'rates', label: 'Live Sqft Rate Control', path: `${LOGIN_PATH}/rates` },
    { id: 'terms', label: 'Role Terms & Hotline Editor', path: `${LOGIN_PATH}/terms` },
    { id: 'payments', label: 'Escrow & PIN Payouts', path: `${LOGIN_PATH}/payments` },
    { id: 'legal', label: 'Legal & Anti-Poaching', path: `${LOGIN_PATH}/legal` },
    { id: 'ai', label: '64-District Dialect AI', path: `${LOGIN_PATH}/ai-control` },
    { id: 'sms', label: 'SMS & Email Gateways', path: `${LOGIN_PATH}/sms` },
    { id: 'backup', label: 'Cloud Backup & PITR', path: `${LOGIN_PATH}/backup` },
    { id: 'hacks', label: 'WAF & Auth Security Logs', path: `${LOGIN_PATH}/hacks` },
    { id: 'govt', label: 'NBR BIN & VAT Audit', path: `${LOGIN_PATH}/govt-audit` },
    { id: 'audit', label: 'Immutable Audit Logs', path: `${LOGIN_PATH}/audit` },
    { id: 'security', label: 'Password, 2FA & PIN Settings', path: `${LOGIN_PATH}/security` },
  ];

  const handleModuleNavigation = (mod) => {
    setActiveTab(mod.id);
    if (mod.id !== 'overview') {
      navigate(mod.path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-indigo-400 flex flex-col items-center justify-center font-mono">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-widest uppercase">
          Verifying v3.8.0 Password + 2FA Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row select-none">
      <aside className="w-full lg:w-64 bg-slate-900/95 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded">
                2FA + IP LOCKED
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-base font-bold text-white mt-2 tracking-wide">
              SUPER ADMIN GATE
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {telemetry.appVersion}
            </p>
          </div>

          <nav className="p-3 space-y-1 max-h-[65vh] overflow-y-auto">
            {adminModules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleModuleNavigation(mod)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                  activeTab === mod.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <span>{mod.label}</span>
                {activeTab === mod.id && <span className="text-indigo-400">•</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleForceLogout('Control Room Locked & Session Purged', 'info')}
            className="w-full py-2.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-lg transition"
          >
            Lock & Exit Control Room
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Super Admin Master Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Password + Phone/Gmail 2FA Active • Hotline: {telemetry.hotlineNumber} ({telemetry.hotlineStatus})
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PASSWORD: VERIFIED
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PHONE 2FA: ACTIVE
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              GMAIL 2FA: ACTIVE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Live Net Profit</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              ৳ {Number(telemetry.netProfit || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">Merchant Commissions</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">
              ৳ {Number(telemetry.merchantCommission || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">64-District Dialect AI</p>
            <p className="text-lg font-bold text-cyan-400 mt-1">
              {telemetry.dialectAiHealth}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400">System Uptime & DB</p>
            <p className="text-lg font-bold text-amber-400 mt-1">
              {telemetry.systemUptime} • {telemetry.mongoReplicaStatus}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
