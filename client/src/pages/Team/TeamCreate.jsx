import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Users } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import Card from '../../components/Card';

export default function TeamCreate() {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    const cleanPhone = memberPhone.trim();
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      error('Enter a valid 11-digit Mistri mobile number.');
      return;
    }
    if (members.includes(cleanPhone)) {
      error('This member is already added.');
      return;
    }
    setMembers((prev) => [...prev, cleanPhone]);
    setMemberPhone('');
  };

  const handleRemoveMember = (phoneToRemove) => {
    setMembers((prev) => prev.filter((p) => p !== phoneToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      error('Team name is required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/teams', {
        name: teamName.trim(),
        memberPhones: members,
      });
      success('Mistri team created successfully.');
      navigate('/teams', { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Mistri Team</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Form a team to split job slots and share 80% Mistri earnings equally
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Dhaka Metro Paint Squad"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Add Team Members (Mobile Number)</label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="flex-1 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-sm font-medium hover:opacity-90"
              >
                <UserPlus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                <Users size={14} />
                <span>Added Members ({members.length})</span>
              </p>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {members.map((phone) => (
                  <div key={phone} className="py-2 flex items-center justify-between text-sm">
                    <span className="font-mono">{phone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(phone)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition"
          >
            {loading ? 'Creating Team...' : 'Save & Create Team'}
          </button>
        </form>
      </Card>
    </div>
  );
}
