import { create } from 'zustand';
import api from '../lib/api';

const useKitchenStore = create((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  // ── Fetch all active orders for this restaurant ────────────────────────────
  fetchOrders: async (restaurantId, statusFilter = 'pending,preparing,ready') => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(
        `/orders?restaurantId=${restaurantId}&status=${statusFilter}`
      );
      set({ orders: data, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.error || 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  // ── Fetch completed orders separately ────────────────────────────────────
  fetchCompletedOrders: async (restaurantId) => {
    try {
      const { data } = await api.get(
        `/orders?restaurantId=${restaurantId}&status=completed`
      );
      set((state) => ({
        orders: [
          ...state.orders.filter((o) => o.status !== 'completed'),
          ...data,
        ],
      }));
    } catch {
      // silent fail
    }
  },

  // ── Update order status via API ───────────────────────────────────────────
  updateStatus: async (orderId, newStatus) => {
    try {
      const { data: updatedOrder } = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      set((state) => ({
        orders: state.orders.map((o) =>
          o._id === orderId ? updatedOrder : o
        ),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Update failed' };
    }
  },

  // ── Add new order from Socket.io event ───────────────────────────────────
  addOrderFromSocket: (newOrder) => {
    const exists = get().orders.find((o) => o._id === newOrder._id);
    if (exists) return;
    set((state) => ({ orders: [newOrder, ...state.orders] }));
  },

  // ── Update order from Socket.io event ────────────────────────────────────
  updateOrderFromSocket: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === updatedOrder._id ? updatedOrder : o
      ),
    }));
  },

  clearOrders: () => set({ orders: [] }),
}));

export default useKitchenStore;
