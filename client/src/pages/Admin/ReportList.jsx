import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | resolved | rejected
  const [typeFilter, setTypeFilter] = useState('all'); // all | job | mistri | payment | fraud | other

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports', { params: { status: filter === 'all' ? '' : filter } });
      setReports(data?.reports || data || []);
    } catch {
      toast.error('Report Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [filter]);

  // Resolve / Reject Report
  const handleStatus = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}/status`, { status });
      toast.success(`Report ${status}`);
      fetchReports();
    } catch {
      toast.error('Status Change Failed');
    }
  };

  const filtered = typeFilter === 'all' ? reports : reports.filter((r) => r.type === typeFilter);
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Report List ({filtered.length}) {pendingCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount} Pending</span>}</h1>

      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {['all', 'pending', 'resolved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {['all', 'job', 'mistri', 'payment', 'fraud', 'other'].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-sm capitalize ${typeFilter === t ? 'bg-gray-800 text-white' : 'bg-white border'}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Report নাই</p>}

      <div className="space-y-3 mt-3">
        {filtered.map((r) => (
          <div key={r._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between">
              <p className="font-bold">{r.title || r.reason || 'Report'} <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full capitalize">{r.type}</span></p>
              <span className={`px-2 py-1 rounded-full text-xs h-fit capitalize ${r.status === 'resolved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status || 'pending'}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{r.description || r.message}</p>
            <p className="text-xs text-gray-400 mt-1">By: {r.reporter?.name || r.user?.name || 'Unknown'} • Against: {r.reportedUser?.name || r.mistri?.name || r.job?.title || '-'} • {new Date(r.createdAt).toLocaleDateString('bn-BD')}</p>

            {r.proofImage && <img src={r.proofImage} className="w-32 h-32 object-cover rounded-lg mt-2" alt="" />}

            {r.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleStatus(r._id, 'resolved')} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold">Resolve</button>
                <button onClick={() => handleStatus(r._id, 'rejected')} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;