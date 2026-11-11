import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const APP_VERSION = '1.0.0';
export const API_VERSION = 'v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': APP_VERSION,
    'X-Api-Version': API_VERSION,
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['X-Api-Version']) {
      config.headers['X-Api-Version'] = API_VERSION;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || 'Request failed';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      console.error('Forbidden:', message);
    }

    if (status >= 500) {
      console.error('Server Error:', message);
    }

    return Promise.reject(new Error(message));
  }
);

export default api;