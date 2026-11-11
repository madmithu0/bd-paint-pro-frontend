import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('members'); // members | jobs

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teams/${id}`);
      setTeam(data?.team || data);
      const j = await api.get(`/teams/${id}/jobs`);
      setJobs(j.data?.jobs || j.data || []);
    } catch {
      toast.error('Team Details Load Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!team) return <div className="p-4 text-center">Team পাওয়া যায়নি</div>;

  const members = team.members || [];
  const totalEarned = jobs.reduce((s, j) => s + (j.totalPrice || j.price || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/teams" className="text-blue-600 text-sm">← Team List</Link>

      {/* Team Details Show */}
      <div className="bg-white rounded-xl shadow p-5 mt-3">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs h-fit">{team.status || 'Active'}</span>
        </div>
        <p className="text-gray-500 mt-1">{team.description || 'No description'}</p>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-2xl font-bold">{members.length}</p><p className="text-xs">Members</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-2xl font-bold">{jobs.length}</p><p className="text-xs">Jobs</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-2xl font-bold">৳{totalEarned.toLocaleString()}</p><p className="text-xs">Total Earned</p></div>
        </div>
        <div className="mt-4 border-t pt-3 text-sm space-y-1">
          <p><b>Leader:</b> {team.leader?.name || team.leaderId || 'N/A'} - {team.leader?.phone || ''}</p>
          <p><b>Created:</b> {new Date(team.createdAt).toLocaleDateString('bn-BD')}</p>
          <p><b>Team ID:</b> {team._id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4">
        <button onClick={() => setTab('members')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'members' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Member List ({members.length})</button>
        <button onClick={() => setTab('jobs')} className={`flex-1 py-2 rounded-lg font-bold ${tab === 'jobs' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Job List ({jobs.length})</button>
      </div>

      {tab === 'members' && (
        <div className="bg-white rounded-xl shadow p-4 mt-3 space-y-2">
          {members.length === 0 && <p className="text-center text-gray-400 py-6">কোনো Member নাই</p>}
          {members.map((m, i) => (
            <div key={m._id || i} className="flex justify-between items-center border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <img src={m.mistri?.photo || m.photo || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <p className="font-bold">{m.mistri?.name || m.name || 'Mistri'} {m.role === 'leader' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">LEADER</span>}</p>
                  <p className="text-xs text-gray-500">{m.mistri?.phone || m.phone || ''} • {m.role}</p>
                </div>
              </div>
              <Link to={`/profile/${m.mistriId || m._id}`} className="text-blue-600 text-sm">Profile</Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="bg-white rounded-xl shadow p-4 mt-3 space-y-2">
          {jobs.length === 0 && <p className="text-center text-gray-400 py-6">কোনো Job নাই</p>}
          {jobs.map((j) => (
            <Link key={j._id} to={`/jobs/${j._id}`} className="flex justify-between border rounded-lg p-3 hover:bg-gray-50">
              <div>
                <p className="font-bold">{j.title || j.address || 'Job'}</p>
                <p className="text-xs text-gray-500">{j.sqft} Sqft • {j.status}</p>
              </div>
              <p className="font-bold">৳{(j.totalPrice || j.price || 0).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamDetails;