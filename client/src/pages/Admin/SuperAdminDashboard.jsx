import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Active Integrated Admin Sidebar Tab (Merged File 146 -> 147)
  const [activeTab, setActiveTab] = useState('overview');

  // System & Stealth Control Room Telemetry State
  const [loading, setLoading] = useState(true);
  const [voiceLockStatus, setVoiceLockStatus] = useState({
    isEnrolled: false,
    canEnroll: false,
    remainingSeconds: 0,
  });

  const [telemetry, setTelemetry] = useState({
    appVersion: 'v3.0.0 SELF-HEALING LOCK',
    platformShare15: 0,
    platformShare20: 0,
    totalPlatformRevenue: 0,
    mongoReplicaStatus: 'HEALTHY (3-NODE)',
    lastPitrTimestamp: 'Synced',
    selfHealingMode: 'ACTIVE',
    activeCircuitBreakers: 0,
    layersVerified: {
      phoneOtp: true,
      gmailOtp: true,
      liveVoice: true,
      liveFace3D: true,
    },
  });

  // Verify 4-Layer Session Token & Fetch Live Control Room Status
  const fetchDashboardStatus = useCallback(async () => {
    const token = localStorage.getItem('super_admin_4layer_token');
    if (!token) {
      navigate('/x9-super-2026');
      return;
    }

    try {
      const [dashRes, voiceRes] = await Promise.all([
        api.get('/x9-super-2026/dashboard-status', {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-super-token': token,
          },
        }),
        api.get('/x9-super-2026/voice-status').catch(() => ({ data: {} })),
      ]);

      if (dashRes.data?.success) {
        const data = dashRes.data.data || dashRes.data;
        const lv = data.layersVerified || {};
        const allFourGreen =
          lv.phoneOtp && lv.gmailOtp && lv.liveVoice && lv.liveFace3D;

        if (data.layersVerified && !allFourGreen && !data.hardwareRecoveryActive) {
          localStorage.removeItem('super_admin_4layer_token');
          showToast('Security Lock Triggered: 4-Layer verification incomplete', 'error');
          navigate('/x9-super-2026');
          return;
        }

        setTelemetry((prev) => ({
          ...prev,
          ...data,
        }));
      }

      if (voiceRes.data?.success) {
        setVoiceLockStatus({
          isEnrolled: Boolean(voiceRes.data.isEnrolled),
          canEnroll: Boolean(voiceRes.data.canEnroll),
          remainingSeconds: Number(voiceRes.data.remainingSeconds || 0),
        });
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('super_admin_4layer_token');
        navigate('/x9-super-2026');
      } else {
        showToast('Failed to sync live system telemetry', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    fetchDashboardStatus();
    const pollInterval = setInterval(fetchDashboardStatus, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchDashboardStatus]);

  // Emergency Session Lock & Exit
  const handleLockSession = () => {
    localStorage.removeItem('super_admin_4layer_token');
    showToast('Control Room Locked & Session Purged', 'info');
    navigate('/x9-super-2026');
  };
  // Integrated Sidebar Navigation Items (Merged File 146 -> 147)
  const adminModules = [
    { id: 'overview', label: 'Control Room Overview', path: '/x9-super-2026/dashboard' },
    { id: 'users', label: 'User & Merchant Panel', path: '/x9-super-2026/users' },
    { id: 'kill', label: 'Global Kill Switch', path: '/x9-super-2026/kill' },
    { id: 'payments', label: 'Payment & Split Approve', path: '/x9-super-2026/payments' },
    { id: 'ai', label: 'AI Wall Diagnostics', path: '/x9-super-2026/ai-measure' },
    { id: 'materials', label: 'Material Inventory', path: '/x9-super-2026/materials' },
    { id: 'sms', label: 'SMS Gateway Panel', path: '/x9-super-2026/sms' },
    { id: 'backup', label: 'MongoDB Replica & PITR', path: '/x9-super-2026/backup' },
    { id: 'hacks', label: 'WAF & ClamAV Security', path: '/x9-super-2026/hacks' },
    { id: 'govt', label: 'NBR / VAT Govt Audit', path: '/x9-super-2026/govt-audit' },
    { id: 'audit', label: 'System Audit Logs', path: '/x9-super-2026/audit' },
    { id: 'reports', label: 'Executive Reports', path: '/x9-super-2026/reports' },
    { id: 'notify', label: 'Broadcast Notifications', path: '/x9-super-2026/notifications' },
    { id: 'hide', label: 'Stealth & Biometric Status', path: '/x9-super-2026/hide-control' },
  ];

  const handleModuleNavigation = (mod) => {
    setActiveTab(mod.id);
    if (mod.id !== 'overview') {
      navigate(mod.path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-emerald-400 flex flex-col items-center justify-center font-mono">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-widest uppercase">Verifying 4-Layer Biometric Lock...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row select-none">

      {/* INTEGRATED ADMIN SIDEBAR (Merged from File 146) */}
      <aside className="w-full lg:w-64 bg-slate-900/95 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                IDENTITY: CLOAKED
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-base font-bold text-white mt-2 tracking-wide">
              STEALTH CONTROL ROOM
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
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <span>{mod.label}</span>
                {activeTab === mod.id && <span className="text-emerald-400">•</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLockSession}
            className="w-full py-2.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-lg transition"
          >
            Lock & Exit Control Room
          </button>
        </div>
      </aside>
      {/* MAIN CONTROL ROOM WORKSPACE */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6">

        {/* Top Telemetry & 4-Layer Green Verification Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Super Admin Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Isolated Backdoor Session • Zero Public Frontend References • IP Whitelist Active • Auto-Hide OFF
            </p>
          </div>

          {/* 4-Layer Green Status Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'L1: Phone OTP', ok: telemetry.layersVerified?.phoneOtp },
              { label: 'L2: Gmail OTP', ok: telemetry.layersVerified?.gmailOtp },
              { label: 'L3: Live Voice', ok: telemetry.layersVerified?.liveVoice },
              { label: 'L4: 3D Face', ok: telemetry.layersVerified?.liveFace3D },
            ].map((layer, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                  layer.ok
                    ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-950/70 text-rose-400 border-rose-500/40'
                }`}
              >
                <span>{layer.ok ? '✓' : '✕'}</span>
                {layer.label}
              </span>
            ))}
          </div>
        </div>

        {/* Core Metrics & Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Card 1: Total Platform Share (15% / 20%) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Total Platform Share
            </span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ৳ {Number(telemetry.totalPlatformRevenue || 0).toLocaleString()}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>With Agent (15%): ৳{Number(telemetry.platformShare15 || 0).toLocaleString()}</span>
              <span>Direct (20%): ৳{Number(telemetry.platformShare20 || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Card 2: MongoDB Replica & PITR Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              MongoDB Replica & PITR
            </span>
            <div className="text-lg font-bold text-cyan-400 font-mono">
              {telemetry.mongoReplicaStatus}
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Oplog CDC & S3/R2:</span>
              <span className="text-emerald-400 font-mono">{telemetry.lastPitrTimestamp}</span>
            </div>
          </div>
          {/* Card 3: Self-Healing Health Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Self-Healing Engine
            </span>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              {telemetry.selfHealingMode}
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Tripped Circuit Breakers:</span>
              <span className="text-slate-200 font-mono">{telemetry.activeCircuitBreakers}</span>
            </div>
          </div>

          {/* Card 4: Locked App Version */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Architecture Version Lock
            </span>
            <div className="text-base font-bold text-indigo-400 font-mono">
              {telemetry.appVersion}
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>API Gateway:</span>
              <span className="text-emerald-400 font-mono">/api/v1/ LOCKED</span>
            </div>
          </div>
        </div>

        {/* Lifetime Voice Lock & Stealth Policy Status Banner (5-Minute Auto-Hide Removed) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-white">
                Stealth Access & Lifetime Voice Biometric Lock
              </h2>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded border bg-slate-950 text-slate-300 border-slate-700">
                AUTO-HIDE: PERMANENTLY OFF
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded border ${
                  voiceLockStatus.isEnrolled
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-400 border-amber-500/40'
                }`}
              >
                {voiceLockStatus.isEnrolled
                  ? 'LIFETIME VOICE: LOCKED'
                  : voiceLockStatus.canEnroll
                  ? `ENROLLMENT WINDOW: ${voiceLockStatus.remainingSeconds}s LEFT`
                  : 'ENROLLMENT WINDOW: CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              The 5-minute auto-hide timer is disabled. Control room security is enforced permanently via IP Whitelist, Secret Route (/x9-super-2026), and 4-Layer Biometric verification using your locked lifetime voice signature.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-slate-950 p-4 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/x9-super-2026/hide-control')}
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              View Biometric Lock Details
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SuperAdminDashboard;
