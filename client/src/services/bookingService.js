import api from '../utils/api';

const bookingService = {
  createBooking: async (bookingData) => {
    const { data } = await api.post('/bookings', bookingData);
    return data?.booking || data;
  },

  getBookingById: async (id) => {
    const { data } = await api.get(`/bookings/${id}`);
    return data?.booking || data;
  },

  getMyBookings: async (params = {}) => {
    const { data } = await api.get('/bookings/my-bookings', { params });
    return data;
  },

  getBookingsForTrip: async (tripId) => {
    const { data } = await api.get(`/bookings/trip/${tripId}`);
    return data?.bookings || data;
  },

  acceptBooking: async (id) => {
    const { data } = await api.put(`/bookings/${id}/accept`);
    return data;
  },

  rejectBooking: async (id, reason) => {
    const { data } = await api.put(`/bookings/${id}/reject`, { reason });
    return data;
  },

  cancelBooking: async (id, reason) => {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    return data;
  },

  completeBooking: async (id) => {
    const { data } = await api.put(`/bookings/${id}/complete`);
    return data;
  },

  rateBooking: async (id, rating, comment) => {
    const { data } = await api.post(`/bookings/${id}/rate`, { rating, comment });
    return data;
  },
};

export default bookingService;