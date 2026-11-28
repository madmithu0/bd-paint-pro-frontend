import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import useToast from '../../hooks/useToast';

const TOKEN_KEY = 'super_admin_v380_token';
const LOGIN_PATH = '/x9-super-2026';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pinData, setPinData] = useState({
    currentPassword: '',
    newTransactionPin: '',
    confirmTransactionPin: '',
  });

  const [ipList, setIpList] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      Authorization: `Bearer ${token}`,
      'x-super-token': token,
    };
  };

  const fetchSecurityConfig = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    try {
      const res = await api.get(`${LOGIN_PATH}/security-config`, {
        headers: getAuthHeaders(),
      });
      if (res.data?.success) {
        const cfg = res.data.data || res.data;
        setIpList((cfg.allowedIps || []).join(', '));
        setSessionTimeout(cfg.sessionTimeoutMinutes || 30);
        setTwoFactorEnabled(cfg.twoFactorEnabled !== false);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate(LOGIN_PATH, { replace: true });
      } else {
        showToast('Failed to load security configuration', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    fetchSecurityConfig();
  }, [fetchSecurityConfig]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 10) {
      showToast('New password must be at least 10 characters', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(
        `${LOGIN_PATH}/update-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        showToast('Master Password updated successfully', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setSaving(false);
    }
  };
  const handlePinUpdate = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinData.newTransactionPin)) {
      showToast('Transaction PIN must be exactly 6 digits', 'error');
      return;
    }
    if (pinData.newTransactionPin !== pinData.confirmTransactionPin) {
      showToast('Transaction PINs do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(
        `${LOGIN_PATH}/update-transaction-pin`,
        {
          currentPassword: pinData.currentPassword,
          newTransactionPin: pinData.newTransactionPin,
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        showToast('Transaction PIN updated successfully', 'success');
        setPinData({
          currentPassword: '',
          newTransactionPin: '',
          confirmTransactionPin: '',
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'PIN update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNetworkConfigSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedIps = ipList
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean);

      const res = await api.put(
        `${LOGIN_PATH}/security-config`,
        {
          allowedIps: parsedIps,
          sessionTimeoutMinutes: Number(sessionTimeout),
          twoFactorEnabled,
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        showToast('Security & IP whitelist settings saved', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-indigo-400 flex items-center justify-center font-mono text-xs">
        LOADING v3.8.0 SECURITY SETTINGS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            Super Admin Security Settings (v3.8.0)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Password Rotation • Phone/Gmail 2FA • Transaction PIN • IP Whitelist
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${LOGIN_PATH}/dashboard`)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
        >
          Back to Dashboard
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handlePasswordUpdate}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs"
        >
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            Change Master Password
          </h2>
          <div>
            <label className="block text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">New Strong Password (Min 10 chars)</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            Update Master Password
          </button>
        </form>

        <form
          onSubmit={handlePinUpdate}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs"
        >
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
            Reset 6-Digit Transaction PIN
          </h2>
          <div>
            <label className="block text-slate-400 mb-1">Verify Master Password</label>
            <input
              type="password"
              required
              value={pinData.currentPassword}
              onChange={(e) =>
                setPinData({ ...pinData, currentPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">New 6-Digit Payout PIN</label>
            <input
              type="password"
              maxLength={6}
              required
              value={pinData.newTransactionPin}
              onChange={(e) =>
                setPinData({ ...pinData, newTransactionPin: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tracking-widest"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Confirm 6-Digit Payout PIN</label>
            <input
              type="password"
              maxLength={6}
              required
              value={pinData.confirmTransactionPin}
              onChange={(e) =>
                setPinData({ ...pinData, confirmTransactionPin: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            Save Transaction PIN
          </button>
        </form>
      </div>

      <form
        onSubmit={handleNetworkConfigSave}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs"
      >
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
          IP Whitelist & 2FA Session Lock
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1">
              Allowed IP Addresses (Comma Separated)
            </label>
            <input
              type="text"
              value={ipList}
              onChange={(e) => setIpList(e.target.value)}
              placeholder="e.g. 103.145.22.10, 192.168.1.1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Session Timeout (Minutes)</label>
            <input
              type="number"
              min={5}
              max={240}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600"
            />
            Enforce Dual OTP (Phone + Gmail) on Every Login
          </label>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
          >
            Save Access Policy
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
