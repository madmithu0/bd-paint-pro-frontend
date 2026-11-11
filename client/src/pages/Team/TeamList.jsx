import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLeaderModal, setShowLeaderModal] = useState(null); // teamId
  const [newLeaderId, setNewLeaderId] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams', { params: { search } });
      setTeams(data?.teams || data || []);
    } catch {
      toast.error('Team List Load Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  // Leader Change
  const handleLeaderChange = async (teamId) => {
    if (!newLeaderId.trim()) return toast.error('New Leader ID দিন');
    try {
      await api.put(`/teams/${teamId}/leader`, { leaderId: newLeaderId });
      toast.success('Leader Changed');
      setShowLeaderModal(null);
      setNewLeaderId('');
      fetchTeams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Leader Change Failed');
    }
  };

  // Member Remove
  const handleMemberRemove = async (teamId, memberId) => {
    if (!window.confirm('এই Member কে Remove করবেন?')) return;
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      toast.success('Member Removed');
      fetchTeams();
    } catch {
      toast.error('Member Remove Failed');
    }
  };

  const filtered = teams.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Team List ({filtered.length})</h1>
        <Link to="/teams/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ New Team</Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Team Search..."
        className="w-full border rounded-lg p-3 mb-4"
      />

      {filtered.length === 0 && <p className="text-center text-gray-500 py-10">কোনো Team নাই</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((team) => (
          <div key={team._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between">
              <Link to={`/teams/${team._id}`} className="font-bold text-lg text-blue-700">{team.name}</Link>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full h-fit">{team.status || 'Active'}</span>
            </div>

            <p className="text-sm text-gray-500 mt-1">Leader: {team.leader?.name || team.leaderId || 'N/A'} | {team.leader?.phone || ''}</p>
            <p className="text-sm mt-1">Members: <b>{team.members?.length || 0} জন</b></p>

            {/* Member List with Remove */}
            <div className="mt-3 space-y-1">
              {team.members?.slice(0, 4).map((m) => (
                <div key={m._id || m.mistriId} className="flex justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{m.mistri?.name || m.name || m.mistriId} - {m.role}</span>
                  <button onClick={() => handleMemberRemove(team._id, m.mistriId || m._id)} className="text-red-500 text-xs">Remove</button>
                </div>
              ))}
              {team.members?.length > 4 && <p className="text-xs text-gray-400">+ {team.members.length - 4} more...</p>}
            </div>

            <div className="flex gap-2 mt-4">
              <Link to={`/teams/${team._id}`} className="flex-1 text-center bg-gray-100 py-2 rounded-lg text-sm">Details</Link>
              <button onClick={() => setShowLeaderModal(team._id)} className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg text-sm">Leader Change</button>
            </div>
          </div>
        ))}
      </div>

      {/* Leader Change Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-bold mb-3">Leader Change</h3>
            <input value={newLeaderId} onChange={(e) => setNewLeaderId(e.target.value)} placeholder="New Leader Mistri ID / Phone" className="w-full border rounded-lg p-3" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowLeaderModal(null)} className="flex-1 bg-gray-100 py-2 rounded-lg">Cancel</button>
              <button onClick={() => handleLeaderChange(showLeaderModal)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamList;