import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TeamCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    leaderId: '',
    description: '',
  });
  const [members, setMembers] = useState([{ mistriId: '', role: 'mistri' }]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Mistri Search for Member Add
  const searchMistri = async (q) => {
    setSearch(q);
    if (q.length < 2) return setSearchResults([]);
    try {
      const { data } = await api.get('/users/drivers', { params: { search: q } });
      setSearchResults(data?.users || data?.drivers || []);
    } catch { /* ignore */ }
  };

  const addMember = (mistri) => {
    if (members.find((m) => m.mistriId === mistri._id)) {
      toast.error('এই মিস্ত্রি already added');
      return;
    }
    // Replace empty first row, else push
    if (members.length === 1 && !members[0].mistriId) {
      setMembers([{ mistriId: mistri._id, role: 'mistri', name: mistri.name, phone: mistri.phone }]);
    } else {
      setMembers([...members, { mistriId: mistri._id, role: 'mistri', name: mistri.name, phone: mistri.phone }]);
    }
    setSearch('');
    setSearchResults([]);
  };

  const removeMemberRow = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const addEmptyRow = () => {
    setMembers([...members, { mistriId: '', role: 'mistri' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Team Name দিন');
    if (!form.leaderId.trim() && !members[0]?.mistriId) return toast.error('Leader / Member দিন');

    const payload = {
      name: form.name,
      leaderId: form.leaderId || members[0]?.mistriId,
      description: form.description,
      members: members.filter((m) => m.mistriId).map((m) => ({ mistriId: m.mistriId, role: m.role })),
    };

    setLoading(true);
    try {
      const { data } = await api.post('/teams', payload);
      toast.success('Team Created Successfully');
      navigate(`/teams/${data?.team?._id || data?._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Team Create Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Team Create</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
        <div>
          <label className="font-medium">Team Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ex: Khulna Paint Team 1" className="w-full border rounded-lg p-3 mt-1" required />
        </div>

        <div>
          <label className="font-medium">Leader ID / Phone (Optional - Member থেকে নিবে)</label>
          <input name="leaderId" value={form.leaderId} onChange={handleChange} placeholder="Leader User ID" className="w-full border rounded-lg p-3 mt-1" />
        </div>

        <div>
          <label className="font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Team সম্পর্কে..." className="w-full border rounded-lg p-3 mt-1" />
        </div>

        {/* Member Add */}
        <div>
          <div className="flex justify-between items-center">
            <label className="font-bold">Member Add ({members.filter(m=>m.mistriId).length} জন)</label>
            <button type="button" onClick={addEmptyRow} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">+ Add Row</button>
          </div>

          <input value={search} onChange={(e)=>searchMistri(e.target.value)} placeholder="Mistri Search - Name / Phone..." className="w-full border rounded-lg p-3 mt-2" />
          {searchResults.length > 0 && (
            <div className="border rounded-lg mt-1 max-h-48 overflow-auto bg-white shadow">
              {searchResults.map((u)=>(
                <button key={u._id} type="button" onClick={()=>addMember(u)} className="w-full text-left p-3 border-b hover:bg-gray-50 flex justify-between">
                  <span>{u.name} - {u.phone}</span><span className="text-blue-600">+ Add</span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2 mt-3">
            {members.map((m, i)=>(
              <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                <input value={m.mistriId} onChange={(e)=>{ const c=[...members]; c[i].mistriId=e.target.value; setMembers(c); }} placeholder="Mistri ID" className="flex-1 border rounded p-2" />
                <select value={m.role} onChange={(e)=>{ const c=[...members]; c[i].role=e.target.value; setMembers(c); }} className="border rounded p-2">
                  <option value="mistri">Mistri</option>
                  <option value="helper">Helper</option>
                  <option value="leader">Leader</option>
                </select>
                <span className="text-xs w-24 truncate">{m.name || ''}</span>
                {members.length > 1 && <button type="button" onClick={()=>removeMemberRow(i)} className="text-red-500 px-2">✕</button>}
              </div>
            ))}
          </div>
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
};

export default TeamCreate;