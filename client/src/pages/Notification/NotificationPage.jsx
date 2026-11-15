import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatDate } from '../../format';
import Card from '../../components/Card';
import Loading from '../../components/Loading';

export default function NotificationPage() {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      error(err.response?.data?.message || 'Unable to update notification status.');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      success('All notifications marked as read.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real-time alerts for jobs, escrow payments, OTP verifications, and payouts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold disabled:opacity-50 self-start"
          >
            <CheckCheck size={15} />
            <span>{markingAll ? 'Updating...' : 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Notifications"
          emptyDescription="You are completely caught up with your alerts."
        />
      ) : (
        <Card noPadding>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                className={`p-4 flex items-start justify-between gap-4 transition ${
                  item.isRead
                    ? 'bg-white dark:bg-slate-900 opacity-75'
                    : 'bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 mt-0.5 shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.text || item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt, true)}</p>
                  </div>
                </div>

                {!item.isRead && (
                  <Circle size={10} className="fill-blue-600 text-blue-600 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
