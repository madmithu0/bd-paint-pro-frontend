import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Save } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import Card from '../../components/Card';
import AvatarUploader from '../../components/AvatarUploader';
import MistriSkillSelector from '../../components/MistriSkillSelector';

export default function ProfilePage() {
  const { user, role, isVerified, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Full name cannot be empty.');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
      error('Enter a valid 11-digit mobile number.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: name.trim(),
        phone: phone.trim(),
      });

      if (data?.user) {
        updateUser(data.user);
      } else {
        updateUser({ name: name.trim(), phone: phone.trim() });
      }
      success('Profile updated successfully.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Personal Profile</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Update your display name, profile photo, and contact number
          </p>
        </div>

        {role === 'Mistri' && (
          <Link
            to="/profile/mistri-verify"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start"
          >
            <ShieldCheck size={16} />
            <span>{isVerified ? 'NID Verified' : 'Complete NID Verification'}</span>
          </Link>
        )}
      </div>

      <AvatarUploader
        currentPhoto={user?.profilePhoto || user?.avatar || ''}
        userName={user?.name || 'User'}
        onUploadSuccess={(uploadedUrl) =>
          updateUser({ profilePhoto: uploadedUrl, avatar: uploadedUrl })
        }
        onResetSuccess={() =>
          updateUser({ profilePhoto: '', avatar: '' })
        }
      />

      <Card>
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={11}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Registered Account Role</span>
            <span className="font-bold text-blue-600 uppercase">{role}</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </form>
      </Card>

      {role === 'Mistri' && (
        <MistriSkillSelector
          initialSelectedIds={user?.capableServices || []}
          onSaveSuccess={(updatedIds) =>
            updateUser({ capableServices: updatedIds })
          }
        />
      )}
    </div>
  );
}
