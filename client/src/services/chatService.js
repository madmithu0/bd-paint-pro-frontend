import api from '../utils/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socket = null;

const chatService = {
  getConversations: async () => {
    const { data } = await api.get('/chats');
    return data?.conversations || data;
  },

  getMessages: async (conversationId, params = {}) => {
    const { data } = await api.get(`/chats/${conversationId}/messages`, { params });
    return data?.messages || data;
  },

  sendMessage: async (conversationId, text) => {
    const { data } = await api.post(`/chats/${conversationId}/messages`, { text });
    return data?.message || data;
  },

  createConversation: async (userId, tripId) => {
    const { data } = await api.post('/chats', { userId, tripId });
    return data?.conversation || data;
  },

  markAsRead: async (conversationId) => {
    const { data } = await api.put(`/chats/${conversationId}/read`);
    return data;
  },

  connectSocket: (token) => {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  getSocket: () => socket,

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinConversation: (conversationId) => {
    socket?.emit('join-conversation', conversationId);
  },

  sendSocketMessage: (conversationId, message) => {
    socket?.emit('send-message', { conversationId, message });
  },
};

export default chatService;