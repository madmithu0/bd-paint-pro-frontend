import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';

const FEATURE_LIST = [
  { key: 'SITE_VISIT', label: 'Site Visit Booking' },
  { key: 'MID_JOB_ADDON', label: 'Mid-Job Service Add-On' },
  { key: 'DIRECT_STORE', label: 'Direct Material E-Commerce Store' },
  { key: 'CHAT', label: 'Real-Time Socket Chat' },
  { key: 'AI_MEASURE', label: 'AI Wall & Dialect Voice Measure' },
  { key: 'BKASH_NAGAD', label: 'bKash & Nagad Payment Gateway' },
  { key: 'AGENT_LEAD_LOCK', label: '30-Day Agent Lead Lock' },
];

export default function KillPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Mistri Signup & Upazila Quota Control (v3.8.1)
  const [mistriSignupEnabled, setMistriSignupEnabled] = useState(true);
  const [maxMistriPerUpazila, setMaxMistriPerUpazila] = useState(0);
  const [mistriReason, setMistriReason] = useState('');

  // Individual Feature Switches (true = killed/disabled in Kill model)
  const [killedFeatures, setKilledFeatures] = useState({});

  // Govt Compliance Switches (OFF by default at startup)
  const [govtFlags, setGovtFlags] = useState({
    autoVatEnabled: false,
    nbrBinMandateEnabled: false,
    govtAuditEnabled: false,
  });

  // Live Hotline Config
  const [hotline, setHotline] = useState({
    number: '',
    isLive: false,
  });

  const showAlert = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4500);
  };

  const fetchKillControls = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/kill/public-status');
      if (data?.success) {
        setKilledFeatures(data.featureSwitches || {});
        if (data.govtFeatureFlags) setGovtFlags(data.govtFeatureFlags);
        if (data.hotlineConfig) setHotline(data.hotlineConfig);
        if (data.mistriSignupControl) {
          setMistriSignupEnabled(Boolean(data.mistriSignupControl.newMistriSignupEnabled));
          setMaxMistriPerUpazila(Number(data.mistriSignupControl.maxMistriPerUpazila) || 0);
        }
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to load control switches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKillControls();
  }, [fetchKillControls]);
  const handleSaveMistriControl = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api.patch('/kill/mistri-signup', {
        newMistriSignupEnabled: Boolean(mistriSignupEnabled),
        maxMistriPerUpazila: Number(maxMistriPerUpazila) || 0,
        reason: mistriReason.trim(),
      });
      if (data?.success) {
        showAlert('success', data.message || 'Mistri registration control updated.');
        setMistriReason('');
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update Mistri control.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async (targetKey) => {
    const currentlyKilled = Boolean(killedFeatures[targetKey]);
    const nextKilled = !currentlyKilled;
    try {
      setSaving(true);
      const { data } = await api.post('/kill', {
        killType: 'FEATURE',
        target: targetKey,
        isKilled: nextKilled,
        active: nextKilled,
        reason: `Toggled ${targetKey} via Super Admin KillPanel`,
      });
      if (data?.success) {
        setKilledFeatures((prev) => ({ ...prev, [targetKey]: nextKilled }));
        showAlert('success', data.message);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to toggle feature switch.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGovtFlags = async () => {
    try {
      setSaving(true);
      const { data } = await api.patch('/kill/govt-switches', govtFlags);
      if (data?.success) {
        showAlert('success', data.message || 'Government compliance flags updated.');
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update Govt flags.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHotline = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api.put('/kill/hotline', {
        hotlineNumber: hotline.number,
        isLive: hotline.isLive,
      });
      if (data?.success) {
        showAlert('success', data.message || 'Hotline configuration updated.');
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update hotline.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading Super Admin Switchboard...</div>;
  }
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Per-Feature & Govt Failsafe Switchboard</h1>
          <p className="text-xs text-slate-500">
            Global Kill All is permanently disabled. Super Admin Password + 2FA login remains locked ON.
          </p>
        </div>
        <button onClick={fetchKillControls} type="button"
          className="mt-2 sm:mt-0 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg">
          Refresh Status
        </button>
      </div>

      {statusMsg.text && (
        <div className={`p-3 rounded-lg text-xs font-semibold border ${
          statusMsg.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. NEW MISTRI REGISTRATION & UPAZILA QUOTA CONTROL (v3.8.1) */}
      <form onSubmit={handleSaveMistriControl} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-indigo-900">New Mistri Registration & Upazila Quota</h2>
            <p className="text-xs text-slate-500">
              Pause new Mistri signups or limit Mistris per Upazila without affecting existing active Mistris.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={mistriSignupEnabled}
              onChange={(e) => setMistriSignupEnabled(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <span className={`text-xs font-bold ${mistriSignupEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {mistriSignupEnabled ? 'SIGNUP ON' : 'SIGNUP PAUSED'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Max Mistris Per Upazila (0 = Unlimited)
            </label>
            <input type="number" min="0" step="1" value={maxMistriPerUpazila}
              onChange={(e) => setMaxMistriPerUpazila(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Reason (Optional)</label>
            <input type="text" value={mistriReason} onChange={(e) => setMistriReason(e.target.value)}
              placeholder="e.g. Roster full for current demand"
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
          {saving ? 'Saving...' : 'Save Mistri Control'}
        </button>
      </form>

      {/* 2. INDIVIDUAL FEATURE SWITCHES */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-800">Modular Feature Switches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURE_LIST.map((feat) => {
            const isEnabled = !killedFeatures[feat.key];
            return (
              <div key={feat.key} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <span className="text-xs font-semibold text-slate-700">{feat.label}</span>
                <button type="button" disabled={saving} onClick={() => handleToggleFeature(feat.key)}
                  className={`px-3 py-1 rounded text-xs font-bold text-white ${
                    isEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {isEnabled ? 'ACTIVE (ON)' : 'KILLED (OFF)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GOVT COMPLIANCE & LIVE HOTLINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-800">Govt Compliance Switches</h2>
          {[
            { key: 'autoVatEnabled', label: 'Auto VAT / Tax Calculation' },
            { key: 'nbrBinMandateEnabled', label: 'NBR BIN & Trade License Mandate' },
            { key: 'govtAuditEnabled', label: 'Govt Audit & Tax Reporting' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between p-2.5 border rounded-lg text-xs cursor-pointer">
              <span className="font-medium text-slate-700">{item.label}</span>
              <input type="checkbox" checked={Boolean(govtFlags[item.key])}
                onChange={(e) => setGovtFlags((prev) => ({ ...prev, [item.key]: e.target.checked }))} />
            </label>
          ))}
          <button type="button" disabled={saving} onClick={handleSaveGovtFlags}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg">
            Update Govt Flags
          </button>
        </div>

        <form onSubmit={handleSaveHotline} className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-800">Live Hotline Configuration</h2>
          <input type="text" value={hotline.number}
            onChange={(e) => setHotline((prev) => ({ ...prev, number: e.target.value }))}
            placeholder="096XXXXXXXX" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input type="checkbox" checked={Boolean(hotline.isLive)}
              onChange={(e) => setHotline((prev) => ({ ...prev, isLive: e.target.checked }))} />
            <span>Show Hotline Live on Navbar & Footer</span>
          </label>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
            Save Hotline
          </button>
        </form>
      </div>
    </div>
  );
}
