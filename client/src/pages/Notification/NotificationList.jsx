import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [typeFilter, setTypeFilter] = useState('all'); // all | job | payment | mistri | system

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { filter } });
      setNotifications(data?.notifications || data || []);
    } catch {
      toast.error('Notification Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, [filter]);

  // Mark as Read
  const markAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(notifications.map((n) => n._id === notifId ? { ...n, isRead: true } : n));
    } catch {}
  };

  // Mark All Read
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success('All Marked as Read');
    } catch {
      toast.error('Failed');
    }
  };

  // Delete Notification
  const handleDelete = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      setNotifications(notifications.filter((n) => n._id !== notifId));
    } catch {
      toast.error('Delete Failed');
    }
  };

  const filtered = typeFilter === 'all' ? notifications : notifications.filter((n) => n.type === typeFilter);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeIcon = (type) => {
    if (type === 'job') return '🔨';
    if (type === 'payment') return '💰';
    if (type === 'mistri') return '👷';
    if (type === 'system') return '⚙️';
    return '🔔';
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Notifications {unreadCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} Unread</span>}</h1>
        <button onClick={markAllRead} className="text-sm text-blue-600 font-bold">Mark All Read</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
        {['all', 'unread', 'read'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{f}</button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {['all', 'job', 'payment', 'mistri', 'system'].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full text-sm capitalize ${typeFilter === t ? 'bg-gray-800 text-white' : 'bg-white border'}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-10">কোনো Notification নাই</p>}

      <div className="space-y-2">
        {filtered.map((n) => (
          <div key={n._id} onClick={() => markAsRead(n._id)} className={`rounded-xl shadow p-4 flex gap-3 cursor-pointer ${n.isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-600'}`}>
            <span className="text-2xl">{typeIcon(n.type)}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message || n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('bn-BD')} • {n.type}</p>
              {n.link && <Link to={n.link} onClick={(e) => e.stopPropagation()} className="text-blue-600 text-xs font-bold">View →</Link>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }} className="text-gray-400 text-sm h-fit">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;