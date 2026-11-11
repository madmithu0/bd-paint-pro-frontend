import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, j, p] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/jobs?limit=5'),
        api.get('/payments?limit=5'),
      ]);
      setStats(s.data?.stats || s.data);
      setRecentJobs(j.data?.jobs || j.data || []);
      setRecentPayments(p.data?.payments || p.data || []);
    } catch {
      toast.error('Dashboard Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  const totalJobs = stats?.totalJobs || 0;
  const totalMistri = stats?.totalMistri || 0;
  const totalCustomer = stats?.totalCustomer || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingJobs = stats?.pendingJobs || 0;
  const pendingMistri = stats?.pendingMistri || 0;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-gray-500">Rong Mistri - সব কিছু এক জায়গায়</p>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Link to="/jobs" className="bg-blue-50 rounded-xl p-4"><p className="text-2xl font-bold text-blue-700">{totalJobs}</p><p className="text-sm">Total Jobs</p></Link>
        <Link to="/mistris" className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-700">{totalMistri}</p><p className="text-sm">Total Mistri</p></Link>
        <Link to="/customers" className="bg-yellow-50 rounded-xl p-4"><p className="text-2xl font-bold text-yellow-700">{totalCustomer}</p><p className="text-sm">Total Customer</p></Link>
        <Link to="/payments" className="bg-purple-50 rounded-xl p-4"><p className="text-2xl font-bold text-purple-700">৳{totalRevenue.toLocaleString()}</p><p className="text-sm">Total Revenue</p></Link>
      </div>

      {/* Pending Alerts */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Link to="/jobs?status=pending" className="bg-orange-100 rounded-xl p-3 flex justify-between"><span>⏳ Pending Jobs</span><b>{pendingJobs}</b></Link>
        <Link to="/mistris?status=pending" className="bg-red-100 rounded-xl p-3 flex justify-between"><span>👷 Pending Mistri Verify</span><b>{pendingMistri}</b></Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 text-center text-sm">
        {[
          { to: '/jobs/create', label: '➕ Job', bg: 'bg-blue-600 text-white' },
          { to: '/mistris', label: '👷 Mistri', bg: 'bg-white' },
          { to: '/payments', label: '💰 Payment', bg: 'bg-white' },
          { to: '/coupons', label: '🎟️ Coupon', bg: 'bg-white' },
          { to: '/reports', label: '📊 Report', bg: 'bg-white' },
          { to: '/settings', label: '⚙️ Settings', bg: 'bg-white' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className={`${l.bg} rounded-xl p-3 shadow`}>{l.label}</Link>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl shadow p-4 mt-4">
        <div className="flex justify-between"><h3 className="font-bold">Recent Jobs</h3><Link to="/jobs" className="text-blue-600 text-sm">View All →</Link></div>
        <div className="space-y-2 mt-2">
          {recentJobs.length === 0 && <p className="text-gray-400 text-sm">কোনো Job নাই</p>}
          {recentJobs.map((j) => (
            <Link key={j._id} to={`/jobs/${j._id}`} className="flex justify-between border-b pb-1 text-sm">
              <span>{j.title || j.address} • {j.sqft} Sqft</span>
              <span className="capitalize text-gray-500">{j.status}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow p-4 mt-3">
        <div className="flex justify-between"><h3 className="font-bold">Recent Payments</h3><Link to="/payments" className="text-blue-600 text-sm">View All →</Link></div>
        <div className="space-y-2 mt-2">
          {recentPayments.length === 0 && <p className="text-gray-400 text-sm">কোনো Payment নাই</p>}
          {recentPayments.map((p) => (
            <Link key={p._id} to={`/payments/${p._id}`} className="flex justify-between border-b pb-1 text-sm">
              <span>{p.invoiceNo || p._id.slice(-8)} • {p.method}</span>
              <span>৳{(p.amount || 0).toLocaleString()} • <span className="capitalize">{p.status}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;