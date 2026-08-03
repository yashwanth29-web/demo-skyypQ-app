import { create } from 'zustand';
import api from '../lib/api';

const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  // ── Fetch customer's own orders from backend ────────────────────────────────
  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/orders/mine');
      set({ orders: data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch orders', isLoading: false });
    }
  },

  // ── Place a new order (called from Checkout.jsx) ────────────────────────────
  addOrder: async (newOrder) => {
    set({ isLoading: true, error: null });
    try {
      const { data: createdOrder } = await api.post('/orders', newOrder);

      set((state) => ({
        orders: [createdOrder, ...state.orders],
        isLoading: false,
      }));

      // Store order ID in sessionStorage for Tracking page
      sessionStorage.setItem('skyyq_active_order_id', createdOrder._id);
      sessionStorage.setItem('skyyq_active_order', JSON.stringify(createdOrder));

      return { success: true, order: createdOrder };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to place order';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // ── Update order status (called from OwnerDashboard via Socket.io event) ───
  updateOrderFromSocket: (updatedOrder) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === updatedOrder._id ? updatedOrder : o
      ),
    }));

    // Also update sessionStorage if this is the active order
    const activeId = sessionStorage.getItem('skyyq_active_order_id');
    if (activeId === updatedOrder._id) {
      sessionStorage.setItem('skyyq_active_order', JSON.stringify(updatedOrder));
    }
  },

  // ── Owner updates order status via API (legacy / fallback support) ──────────
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? data : o)),
      }));
    } catch (err) {
      console.error('Failed to update order status:', err.message);
    }
  },

  updateOrderSlot: (orderId, newSlot) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === orderId ? { ...o, slot: newSlot } : o
      ),
    }));
  },

  clearOrders: () => set({ orders: [], error: null }),
}));

export default useOrderStore;
