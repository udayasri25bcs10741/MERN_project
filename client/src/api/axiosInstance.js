import axios from 'axios';

// When running live on Vercel, use relative '/api/v1' to proxy through Vercel edge to Render without CORS issues
const isBrowser = typeof window !== 'undefined';
const isVercelHost = isBrowser && window.location.hostname.includes('vercel.app');

const rawBaseURL = isVercelHost
  ? '/api/v1'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1').trim();

const baseURL = rawBaseURL.endsWith('/api/v1')
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired or invalid credentials
      localStorage.removeItem('foodbridge_token');
      localStorage.removeItem('foodbridge_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
