import api from '../utils/api';

const userService = {
  getUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data?.user || data;
  },

  updateUser: async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  getDrivers: async (params = {}) => {
    const { data } = await api.get('/users/drivers', { params });
    return data;
  },

  verifyDriver: async (id, status) => {
    const { data } = await api.put(`/users/${id}/verify-driver`, { status });
    return data;
  },

  getUserReviews: async (id, params = {}) => {
    const { data } = await api.get(`/users/${id}/reviews`, { params });
    return data;
  },

  reportUser: async (id, reason, details) => {
    const { data } = await api.post(`/users/${id}/report`, { reason, details });
    return data;
  },

  blockUser: async (id) => {
    const { data } = await api.post(`/users/${id}/block`);
    return data;
  },

  unblockUser: async (id) => {
    const { data } = await api.post(`/users/${id}/unblock`);
    return data;
  },
};

export default userService;