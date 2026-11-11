import api from '../utils/api';

const reviewService = {
  createReview: async ({ tripId, bookingId, rating, comment, revieweeId }) => {
    const { data } = await api.post('/reviews', { tripId, bookingId, rating, comment, revieweeId });
    return data?.review || data;
  },

  getReviewsForUser: async (userId, params = {}) => {
    const { data } = await api.get(`/reviews/user/${userId}`, { params });
    return data;
  },

  getReviewsForTrip: async (tripId) => {
    const { data } = await api.get(`/reviews/trip/${tripId}`);
    return data?.reviews || data;
  },

  getMyReviews: async () => {
    const { data } = await api.get('/reviews/my-reviews');
    return data?.reviews || data;
  },

  updateReview: async (id, { rating, comment }) => {
    const { data } = await api.put(`/reviews/${id}`, { rating, comment });
    return data;
  },

  deleteReview: async (id) => {
    const { data } = await api.delete(`/reviews/${id}`);
    return data;
  },
};

export default reviewService;