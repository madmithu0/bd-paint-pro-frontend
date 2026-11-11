import api from '../utils/api';

const tripService = {
  getTrips: async (params = {}) => {
    const { data } = await api.get('/trips', { params });
    return data;
  },

  getTripById: async (id) => {
    const { data } = await api.get(`/trips/${id}`);
    return data?.trip || data;
  },

  createTrip: async (tripData) => {
    const { data } = await api.post('/trips', tripData);
    return data?.trip || data;
  },

  updateTrip: async (id, tripData) => {
    const { data } = await api.put(`/trips/${id}`, tripData);
    return data?.trip || data;
  },

  deleteTrip: async (id) => {
    const { data } = await api.delete(`/trips/${id}`);
    return data;
  },

  searchTrips: async ({ from, to, date, seats }) => {
    const { data } = await api.get('/trips/search', {
      params: { from, to, date, seats },
    });
    return data?.trips || data;
  },

  getMyTrips: async (params = {}) => {
    const { data } = await api.get('/trips/my-trips', { params });
    return data;
  },

  getNearbyTrips: async (lat, lng, radius = 10) => {
    const { data } = await api.get('/trips/nearby', {
      params: { lat, lng, radius },
    });
    return data?.trips || data;
  },

  cancelTrip: async (id, reason) => {
    const { data } = await api.post(`/trips/${id}/cancel`, { reason });
    return data;
  },

  startTrip: async (id) => {
    const { data } = await api.post(`/trips/${id}/start`);
    return data;
  },

  completeTrip: async (id) => {
    const { data } = await api.post(`/trips/${id}/complete`);
    return data;
  },
};

export default tripService;