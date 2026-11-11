import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, totalSpent: 0, totalReviews: 0 });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me');
      setUser(data?.user || data);
      setStats(data?.stats || { totalJobs: data?.user?.totalJobs || 0, totalSpent: data?.user?.totalSpent || 0, totalReviews: 0 });
    } catch {
      toast.error('Profile Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!user) return <div className="p-4 text-center">Profile পাওয়া যায়নি</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white text-center">
        <img src={user.avatar || 'https://via.placeholder.com/96'} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white" alt="" />
        <h1 className="text-xl font-bold mt-2">{user.name}</h1>
        <p className="text-blue-100 text-sm">{user.phone} • {user.email || 'No Email'}</p>
        <p className="text-xs mt-1 bg-white/20 inline-block px-3 py-1 rounded-full capitalize">{user.role || 'customer'} {user.isVerified ? '✓ Verified' : ''}</p>
        <div className="mt-3">
          <Link to="/profile/edit" className="bg-white text-blue-700 px-5 py-2 rounded-full text-sm font-bold">Edit Profile</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="bg-white rounded-xl shadow p-3"><p className="text-xl font-bold">{stats.totalJobs}</p><p className="text-xs text-gray-500">Total Jobs</p></div>
        <div className="bg-white rounded-xl shadow p-3"><p className="text-xl font-bold">৳{(stats.totalSpent || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Total Spent</p></div>
        <div className="bg-white rounded-xl shadow p-3"><p className="text-xl font-bold">{stats.totalReviews}</p><p className="text-xs text-gray-500">Reviews</p></div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-xl shadow mt-4 divide-y">
        {[
          { to: '/my-jobs', label: '📋 My Jobs', sub: 'আপনার সব Job' },
          { to: '/payments', label: '💰 My Payments', sub: 'Payment History' },
          { to: '/chats', label: '💬 My Chats', sub: 'Mistri / Support Chat' },
          { to: '/coupons', label: '🎟️ My Coupons', sub: 'Available Coupons' },
          { to: '/notifications', label: '🔔 Notifications', sub: 'সব Notification' },
          { to: '/support', label: '🆘 Support', sub: 'Help / Contact' },
          { to: '/settings', label: '⚙️ Settings', sub: 'App Settings' },
        ].map((m) => (
          <Link key={m.to} to={m.to} className="flex justify-between items-center p-4">
            <div><p className="font-bold text-sm">{m.label}</p><p className="text-xs text-gray-400">{m.sub}</p></div>
            <span className="text-gray-300">›</span>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold mt-4">Logout</button>
      <p className="text-center text-xs text-gray-400 mt-3">Rong Mistri v1.0 • Made in Bangladesh 🇧🇩</p>
    </div>
  );
};

export default Profile;