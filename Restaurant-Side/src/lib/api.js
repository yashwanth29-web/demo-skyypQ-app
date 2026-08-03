import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach owner JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skyyq_owner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('skyyq_owner_token');
      localStorage.removeItem('skyyq_owner');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
