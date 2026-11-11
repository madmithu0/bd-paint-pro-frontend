import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | assigned | ongoing | completed | cancelled
  const [search, setSearch] = useState('');
  const [assignJob, setAssignJob] = useState(null); // jobId for assign modal
  const [mistriId, setMistriId] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { params: { status: filter === 'all' ? '' : filter } });
      setJobs(data?.jobs || data || []);
    } catch {
      toast.error('Job List Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [filter]);

  // Job Assign
  const handleAssign = async (jobId) => {
    if (!mistriId.trim()) return toast.error('Mistri ID দিন');
    try {
      await api.put(`/jobs/${jobId}/assign`, { mistriId });
      toast.success('Job Assigned');
      setAssignJob(null); setMistriId('');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assign Failed');
    }
  };

  // Status Change
  const handleStatusChange = async (jobId, status) => {
    try {
      await api.put(`/jobs/${jobId}/status`, { status });
      toast.success(`Status: ${status}`);
      fetchJobs();
    } catch {
      toast.error('Status Change Failed');
    }
  };

  const filtered = jobs.filter((j) =>
    (j.title || j.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => {
    if (s === 'completed') return 'bg-green-100 text-green-700';
    if (s === 'ongoing') return 'bg-blue-100 text-blue-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    if (s === 'assigned') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Job List ({filtered.length})</h1>
        <Link to="/jobs/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ New Job</Link>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Job - Title / Address..." className="w-full border rounded-lg p-3 mb-3" />

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', 'pending', 'assigned', 'ongoing', 'completed', 'cancelled'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Job নাই</p>}

      <div className="space-y-3">
        {filtered.map((job) => {
          const sqft = job.sqft || 0;
          const mistriCount = job.mistriCount || Math.max(1, Math.ceil(sqft / 450));
          const perMistri = job.perMistriShare || ((job.mistriPrice || job.totalPrice || 0) * 0.8) / mistriCount;
          const slots = Math.ceil(sqft / 450) || 0;
          return (
            <div key={job._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between">
                <Link to={`/jobs/${job._id}`} className="font-bold text-lg text-blue-700">{job.title || job.address}</Link>
                <span className={`px-2 py-1 rounded-full text-xs h-fit capitalize ${statusColor(job.status)}`}>{job.status}</span>
              </div>
              <p className="text-sm text-gray-500">{job.address} • {job.phone}</p>

              {/* Slot List Show + Mistri Count + Per Mistri Share */}
              <div className="grid grid-cols-4 gap-2 mt-3 text-center text-sm">
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{sqft}</p><p className="text-xs">Sqft</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{mistriCount} জন</p><p className="text-xs">Mistri Count</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">৳{perMistri.toFixed(0)}</p><p className="text-xs">Per Mistri Share</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="font-bold">{slots} Slot</p><p className="text-xs">Slot List</p></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Slot: {job.slot || 'morning'} • Day: {(sqft / 450).toFixed(2)} • Total: ৳{(job.totalPrice || 0).toLocaleString()}</p>

              <div className="flex gap-2 mt-3">
                <Link to={`/jobs/${job._id}`} className="flex-1 text-center bg-gray-100 py-2 rounded-lg text-sm">Details</Link>
                <button onClick={() => setAssignJob(job._id)} className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg text-sm">Job Assign</button>
                <select value={job.status} onChange={(e) => handleStatusChange(job._id, e.target.value)} className="flex-1 border rounded-lg text-sm p-2 bg-white">
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {assignJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-bold mb-3">Job Assign</h3>
            <input value={mistriId} onChange={(e) => setMistriId(e.target.value)} placeholder="Mistri ID / Phone" className="w-full border rounded-lg p-3" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setAssignJob(null)} className="flex-1 bg-gray-100 py-2 rounded-lg">Cancel</button>
              <button onClick={() => handleAssign(assignJob)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;