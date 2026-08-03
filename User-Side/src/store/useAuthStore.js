import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Register ──────────────────────────────────────────────────────────
      register: async ({ name, email, phone, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/customer/register', {
            name, email, phone, password,
          });
          localStorage.setItem('skyyq_customer_token', data.token);
          localStorage.setItem('skyyq_customer', JSON.stringify(data.customer));
          connectSocket(data.token);
          set({
            customer: data.customer,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.error || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // ── Login ─────────────────────────────────────────────────────────────
      login: async ({ phone, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/customer/login', { phone, password });
          localStorage.setItem('skyyq_customer_token', data.token);
          localStorage.setItem('skyyq_customer', JSON.stringify(data.customer));
          connectSocket(data.token);
          set({
            customer: data.customer,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('skyyq_customer_token');
        localStorage.removeItem('skyyq_customer');
        disconnectSocket();
        set({ customer: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'skyyq-customer-auth',
      partialize: (state) => ({
        customer: state.customer,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
