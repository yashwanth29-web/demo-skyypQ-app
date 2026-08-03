import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { connectOwnerSocket, disconnectOwnerSocket } from '../lib/socket';

const useOwnerStore = create(
  persist(
    (set) => ({
      owner: null,         // { username, restaurantId, restaurantName }
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ────────────────────────────────────────────────────────────
      login: async ({ username, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/owner/login', { username, password });
          localStorage.setItem('skyyq_owner_token', data.token);
          localStorage.setItem('skyyq_owner', JSON.stringify(data.owner));
          connectOwnerSocket(data.token);
          set({
            owner: data.owner,
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

      // ── Register ─────────────────────────────────────────────────────────
      register: async ({ restaurantId, username, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/owner/register', {
            restaurantId, username, password,
          });
          localStorage.setItem('skyyq_owner_token', data.token);
          localStorage.setItem('skyyq_owner', JSON.stringify(data.owner));
          connectOwnerSocket(data.token);
          set({
            owner: data.owner,
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

      // ── Logout ───────────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('skyyq_owner_token');
        localStorage.removeItem('skyyq_owner');
        disconnectOwnerSocket();
        set({ owner: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'skyyq-owner-auth',
      partialize: (state) => ({
        owner: state.owner,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useOwnerStore;
