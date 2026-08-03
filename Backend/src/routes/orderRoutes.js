const express = require('express');
const router = express.Router();
const {
  createOrder, getRestaurantOrders,
  getMyOrders, getOrderById, updateOrderStatus,
  verifyAndCompleteOrder, markCustomerArrived,
  cancelOrder, updateOrderSlot
} = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

// Customer places a new order
router.post('/', verifyToken, requireRole('customer'), createOrder);

// Customer views their own order history
router.get('/mine', verifyToken, requireRole('customer'), getMyOrders);

// Owner fetches all orders for their restaurant
router.get('/', verifyToken, requireRole('owner'), getRestaurantOrders);

// ── Pickup token verification + auto-complete (owner scanner) ──────────────────
// POST /api/orders/verify-pickup  { pickupToken }
router.post('/verify-pickup', verifyToken, requireRole('owner'), verifyAndCompleteOrder);

// Any authenticated user fetches a single order
router.get('/:id', verifyToken, getOrderById);

// Owner updates order status (preparing / ready — NOT completed; use /verify-pickup for that)
router.patch('/:id/status', verifyToken, requireRole('owner'), updateOrderStatus);

// Customer marks themselves as arrived
router.patch('/:id/arrived', verifyToken, requireRole('customer'), markCustomerArrived);

// Customer cancels order
router.patch('/:id/cancel', verifyToken, requireRole('customer'), cancelOrder);

// Customer updates order slot
router.patch('/:id/slot', verifyToken, requireRole('customer'), updateOrderSlot);

module.exports = router;
