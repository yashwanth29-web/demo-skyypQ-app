import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skyyq_customer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('skyyq_customer_token');
      localStorage.removeItem('skyyq_customer');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
