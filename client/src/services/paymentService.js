import api from '../utils/api';

const paymentService = {
  initiatePayment: async ({ bookingId, amount, method }) => {
    const { data } = await api.post('/payments/initiate', { bookingId, amount, method });
    return data;
  },

  verifyPayment: async (transactionId) => {
    const { data } = await api.get(`/payments/verify/${transactionId}`);
    return data;
  },

  getPaymentHistory: async (params = {}) => {
    const { data } = await api.get('/payments/history', { params });
    return data;
  },

  getPaymentById: async (id) => {
    const { data } = await api.get(`/payments/${id}`);
    return data?.payment || data;
  },

  refundPayment: async (id, reason) => {
    const { data } = await api.post(`/payments/${id}/refund`, { reason });
    return data;
  },

  getWalletBalance: async () => {
    const { data } = await api.get('/payments/wallet');
    return data?.balance ?? data;
  },

  addMoneyToWallet: async (amount, method) => {
    const { data } = await api.post('/payments/wallet/add', { amount, method });
    return data;
  },

  getBkashToken: async () => {
    const { data } = await api.get('/payments/bkash/token');
    return data;
  },
};

export default paymentService;