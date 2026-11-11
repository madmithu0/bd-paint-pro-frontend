import api from '../utils/api';

const notificationService = {
  getNotifications: async (params = {}) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data?.count ?? 0;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  clearAll: async () => {
    const { data } = await api.delete('/notifications');
    return data;
  },

  getSettings: async () => {
    const { data } = await api.get('/notifications/settings');
    return data?.settings || data;
  },

  updateSettings: async (settings) => {
    const { data } = await api.put('/notifications/settings', settings);
    return data;
  },
};

export default notificationService;