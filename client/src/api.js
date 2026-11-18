import axios from 'axios';

const API_BASE_URL = 'https://onrender.com';
const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': 'v3.0.0',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url && !config.baseURL.endsWith('/api/v1')) {
      return Promise.reject(new Error('API v1 Lock Violation'));
    }

    const token =
      localStorage.getItem('super_admin_4layer_token') ||
      localStorage.getItem('app_v3_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('app_v3_auth_token');
      localStorage.removeItem('app_v3_user_data');
      if (
        window.location.pathname !== '/login' &&
        !window.location.pathname.includes('x9-super-2026')
      ) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const isNetworkOrServerGlitch =
      !error.response || (error.response.status >= 500 && error.response.status <= 504);

    if (config && isNetworkOrServerGlitch) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const backoffDelay = Math.pow(2, config.__retryCount) * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
