import React, { useState } from 'react';
import { useStore } from '../store';
import useToast from '../hooks/useToast';
import api from '../api';
import Card from '../components/Card';
import DarkModeToggle from '../components/DarkModeToggle';
import LanguageToggle from '../components/LanguageToggle';

export default function SettingsPage() {
  const { language } = useStore();
  const { success, error } = useToast();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    emailAlerts: true,
    jobUpdates: true,
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      success('Password updated successfully.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      success('Notification preference saved.');
      return updated;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Manage your security, language, theme, and notification preferences
        </p>
      </div>

      <Card title="Display & Language Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Interface Language</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Active: {language === 'bn' ? 'বাংলা (Bangla)' : 'English'}
              </p>
            </div>
            <LanguageToggle />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold">Appearance Theme</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Switch between Light and Dark mode
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </Card>

      <Card title="Notification Preferences">
        <div className="space-y-3">
          {[
            { key: 'smsAlerts', label: 'SMS Transaction & OTP Alerts' },
            { key: 'emailAlerts', label: 'Email Invoices & Statements' },
            { key: 'jobUpdates', label: 'Real-Time Job & Chat Notifications' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm font-medium">{item.label}</span>
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() => handleNotificationToggle(item.key)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
              />
            </label>
          ))}
        </div>
      </Card>

      <Card title="Change Account Password">
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Card>
    </div>
  );
}
