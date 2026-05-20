import axios from 'axios';

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal
  ? `http://${window.location.hostname}:5001`
  : 'https://api.annonyme.pro';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rever_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.idempotencyKey) {
    config.headers['X-Idempotency-Key'] = config.idempotencyKey;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rever_token');
      localStorage.removeItem('rever_user');
      if (!window.location.pathname.includes('login')) {
        window.dispatchEvent(new Event('rever:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
