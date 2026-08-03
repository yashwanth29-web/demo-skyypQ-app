import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export const connectOwnerSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('🍳 Kitchen socket connected:', socket.id));
  socket.on('disconnect', (r) => console.log('🍳 Kitchen socket disconnected:', r));
  socket.on('connect_error', (e) => console.error('Kitchen socket error:', e.message));

  return socket;
};

/**
 * Owner App joins the kitchen room for their restaurant.
 * Server authenticates the JWT inside the room join handler.
 */
export const joinKitchenRoom = (restaurantId, token) => {
  if (!socket) connectOwnerSocket(token);
  socket.emit('join:restaurant', { restaurantId, token });
};

export const onNewOrder = (callback) => socket?.on('order:new', callback);
export const offNewOrder = (callback) => socket?.off('order:new', callback);

export const onOrderUpdated = (callback) => socket?.on('order:updated', callback);
export const offOrderUpdated = (callback) => socket?.off('order:updated', callback);

export const disconnectOwnerSocket = () => {
  socket?.disconnect();
  socket = null;
};
