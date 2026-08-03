const jwt = require('jsonwebtoken');

/**
 * Manages Socket.io rooms and event broadcasting.
 *
 * Rooms:
 *   restaurant:{restaurantId}  — owner's kitchen dashboard
 *   order:{orderId}            — customer's tracking page
 */
const initSocketManager = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Owner App joins their restaurant kitchen room ──────────────────────
    socket.on('join:restaurant', ({ restaurantId, token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'owner' || decoded.restaurantId !== restaurantId) {
          socket.emit('error', { message: 'Unauthorized room join' });
          return;
        }
        socket.join(`restaurant:${restaurantId}`);
        console.log(`👨‍🍳 Owner joined kitchen room: restaurant:${restaurantId}`);
        socket.emit('joined:restaurant', { restaurantId });
      } catch {
        socket.emit('error', { message: 'Invalid token for room join' });
      }
    });

    // ── Customer joins their order tracking room ───────────────────────────
    socket.on('join:order', ({ orderId, token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'customer') {
          socket.emit('error', { message: 'Only customers can join order rooms' });
          return;
        }
        socket.join(`order:${orderId}`);
        console.log(`🛒 Customer joined order room: order:${orderId}`);
        socket.emit('joined:order', { orderId });
      } catch {
        socket.emit('error', { message: 'Invalid token for room join' });
      }
    });

    // ── Leave room explicitly ─────────────────────────────────────────────
    socket.on('leave:order', ({ orderId }) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocketManager;
