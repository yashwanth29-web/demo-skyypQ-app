import { useEffect } from 'react';
import {
  connectOwnerSocket, joinKitchenRoom,
  onNewOrder, offNewOrder, onOrderUpdated, offOrderUpdated,
} from '../lib/socket';
import useOwnerStore from '../store/useOwnerStore';
import useKitchenStore from '../store/useKitchenStore';

/**
 * Sets up real-time Socket.io subscription for the kitchen dashboard.
 * - Joins the restaurant room on mount
 * - Listens for 'order:new' and 'order:updated' events
 * - Plays a notification sound and shows browser notification for new orders
 */
export default function useRealtimeOrders() {
  const { owner, token, isAuthenticated } = useOwnerStore();
  const { addOrderFromSocket, updateOrderFromSocket } = useKitchenStore();

  useEffect(() => {
    if (!isAuthenticated || !owner?.restaurantId || !token) return;

    connectOwnerSocket(token);
    joinKitchenRoom(owner.restaurantId, token);

    const handleNewOrder = (order) => {
      addOrderFromSocket(order);

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('🍽️ New Order!', {
          body: `${order.customerName} — ${order.items?.length} item(s) · ₹${order.total}`,
          icon: '/vite.svg',
        });
      }

      // Beep sound (Web Audio API)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      } catch {
        // Audio not available
      }
    };

    const handleOrderUpdated = (order) => {
      updateOrderFromSocket(order);
    };

    onNewOrder(handleNewOrder);
    onOrderUpdated(handleOrderUpdated);

    // Request notification permission on first use
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      offNewOrder(handleNewOrder);
      offOrderUpdated(handleOrderUpdated);
    };
  }, [isAuthenticated, owner?.restaurantId, token]);
}
