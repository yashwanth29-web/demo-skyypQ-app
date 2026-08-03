import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

/**
 * Connect to Socket.io server with a customer JWT.
 * Call this once after the customer logs in.
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => console.log('🔌 Customer socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('🔌 Customer socket disconnected:', reason));
  socket.on('error', (err) => console.error('Socket error:', err));

  return socket;
};

/**
 * Join the tracking room for a specific order.
 * The server will emit 'order:updated' events into this room.
 */
export const joinOrderRoom = (orderId, token) => {
  if (!socket) connectSocket(token);
  socket.emit('join:order', { orderId, token });
};

export const leaveOrderRoom = (orderId) => {
  socket?.emit('leave:order', { orderId });
};

/**
 * Listen for order status updates.
 * @param {Function} callback - Called with the updated order object
 */
export const onOrderUpdate = (callback) => {
  socket?.on('order:updated', callback);
};

export const offOrderUpdate = (callback) => {
  socket?.off('order:updated', callback);
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
