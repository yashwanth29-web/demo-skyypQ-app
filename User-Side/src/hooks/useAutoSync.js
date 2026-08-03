import { useEffect } from 'react';
import { connectSocket, onOrderUpdate, offOrderUpdate, joinOrderRoom } from '../lib/socket';
import useOrderStore from '../store/useOrderStore';
import useAuthStore from '../store/useAuthStore';

/**
 * Replaced 3-second polling with real-time Socket.io subscription.
 * Connects the customer socket once and listens for order:updated events.
 * Any order status change from the kitchen immediately updates the store.
 */
export default function useAutoSync() {
  const { token, isAuthenticated } = useAuthStore();
  const { updateOrderFromSocket, orders } = useOrderStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Ensure socket is connected with the customer's JWT
    connectSocket(token);

    // Listen for any order status updates pushed from the backend
    const handleOrderUpdate = (updatedOrder) => {
      updateOrderFromSocket(updatedOrder);
    };

    onOrderUpdate(handleOrderUpdate);

    return () => {
      offOrderUpdate(handleOrderUpdate);
    };
  }, [isAuthenticated, token, updateOrderFromSocket]);

  // Join rooms for all active orders so updates work globally (Pickup, Profile, etc.)
  useEffect(() => {
    if (!isAuthenticated || !token || !orders.length) return;
    orders.forEach((o) => {
      if (o.status !== 'completed' && o.status !== 'cancelled') {
        joinOrderRoom(o._id, token);
      }
    });
  }, [orders, isAuthenticated, token]);
}
