import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all'); // all | customer | mistri | admin
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | blocked

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { role: roleFilter === 'all' ? '' : roleFilter, status: statusFilter === 'all' ? '' : statusFilter } });
      setUsers(data?.users || data || []);
    } catch {
      toast.error('User Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, statusFilter]);

  // Block / Unblock User
  const handleBlock = async (userId, isBlocked) => {
    if (!window.confirm(isBlocked ? 'Unblock করবেন?' : 'Block করবেন?')) return;
    try {
      await api.put(`/admin/users/${userId}/block`, { isBlocked: !isBlocked });
      toast.success(isBlocked ? 'User Unblocked' : 'User Blocked');
      fetchUsers();
    } catch {
      toast.error('Block Failed');
    }
  };

  // Make Admin
  const handleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`${newRole} বানাবেন?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role Changed to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Role Change Failed');
    }
  };

  const filtered = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">User Manage ({filtered.length})</h1>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Name / Phone / Email..." className="w-full border rounded-lg p-3 mt-3" />

      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {['all', 'customer', 'mistri', 'admin'].map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{r}</button>
        ))}
      </div>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {['all', 'active', 'blocked'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-sm capitalize ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-white border'}`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো User নাই</p>}

      <div className="space-y-3 mt-3">
        {filtered.map((u) => (
          <div key={u._id} className="bg-white rounded-xl shadow p-4 flex gap-3 items-center">
            <img src={u.avatar || 'https://via.placeholder.com/48'} className="w-12 h-12 rounded-full object-cover" alt="" />
            <div className="flex-1">
              <p className="font-bold">{u.name} <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'mistri' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span> {u.isBlocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blocked</span>}</p>
              <p className="text-sm text-gray-500">{u.phone} • {u.email || 'No Email'}</p>
              <p className="text-xs text-gray-400">{u.district || u.location || ''} • Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : ''}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleBlock(u._id, u.isBlocked)} className={`px-3 py-1 rounded-lg text-xs font-bold ${u.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
              <button onClick={() => handleRole(u._id, u.role)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManage;