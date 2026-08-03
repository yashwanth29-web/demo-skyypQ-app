const Order = require('../models/Order');
const Customer = require('../models/Customer');

// ─── Place Order (Customer) ───────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId, restaurantName,
      items, total, type, slot,
      prepTime, suggestedStart, driveTimeMins,
      tableNumber, specialInstructions,
    } = req.body;

    if (!restaurantId || !items?.length || !total) {
      return res.status(400).json({ error: 'restaurantId, items, and total are required' });
    }

    // Attach customer info from JWT
    const customer = await Customer.findById(req.user.id);

    const order = await Order.create({
      restaurantId,
      restaurantName,
      customerId: req.user.id,
      customerName: customer?.name || 'Guest',
      customerPhone: customer?.phone || '',
      items,
      total,
      type: type || 'takeaway',
      slot,
      prepTime,
      suggestedStart,
      driveTimeMins,
      tableNumber,
      specialInstructions: specialInstructions || [],
      isCustomerOrder: true,
      status: 'pending',
    });

    // Emit Socket.io event to restaurant kitchen room
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant:${restaurantId}`).emit('order:new', order);
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// ─── Get All Orders for a Restaurant (Owner) ──────────────────────────────────
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId, status } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    // Ensure owner only sees their own restaurant
    if (req.user.role === 'owner' && req.user.restaurantId !== restaurantId) {
      return res.status(403).json({ error: 'Access denied: not your restaurant' });
    }

    const filter = { restaurantId };
    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      filter.status = { $in: statuses };
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// ─── Get Customer's Own Orders ────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Order ─────────────────────────────────────────────────────────
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      // Try by displayId
      const byDisplayId = await Order.findOne({ displayId: req.params.id }).lean();
      if (!byDisplayId) return res.status(404).json({ error: 'Order not found' });
      return res.json(byDisplayId);
    }

    // Customers can only see their own orders
    if (req.user.role === 'customer' && order.customerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// ─── Update Order Status (Owner) ──────────────────────────────────────────────
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Ensure owner only updates their restaurant's orders
    if (req.user.role === 'owner' && order.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'Access denied: not your restaurant' });
    }

    order.status = status;
    await order.save();

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      // Notify kitchen room (all staff tabs)
      io.to(`restaurant:${order.restaurantId}`).emit('order:updated', order);
      // Notify customer tracking page
      io.to(`order:${order._id}`).emit('order:updated', order);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};
// ─── Verify Pickup Token (Owner Scanner) ─────────────────────────────────────────
// POST /api/orders/verify-pickup
// Body: { pickupToken }
exports.verifyAndCompleteOrder = async (req, res, next) => {
  try {
    const { pickupToken } = req.body;

    if (!pickupToken) {
      return res.status(400).json({ error: 'pickupToken is required' });
    }

    // Find order by token (supports full 24-char token or 8-char short code, case-insensitive)
    const order = await Order.findOne({ 
      pickupToken: { $regex: new RegExp('^' + pickupToken, 'i') } 
    });
    if (!order) {
      return res.status(404).json({ error: 'Invalid pickup code. No matching order found.' });
    }

    if (order.status === 'completed') {
      return res.status(409).json({ error: 'This order has already been completed.' });
    }

    // Ensure owner is scanning their own restaurant's order
    if (req.user.role === 'owner' && order.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'This order does not belong to your restaurant.' });
    }

    // Mark verified ONLY, do NOT complete the order yet
    if (!order.pickupVerified) {
      order.pickupVerified = true;
      await order.save();

      // Emit real-time events that verification succeeded
      const io = req.app.get('io');
      if (io) {
        io.to(`restaurant:${order.restaurantId}`).emit('order:updated', order);
        io.to(`order:${order._id}`).emit('order:updated', order);
      }
    }

    // Return the order so the UI can display "Hand Over" button
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── Mark Customer Arrived ───────────────────────────────────────────────────
// PATCH /api/orders/:id/arrived
exports.markCustomerArrived = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Customers can only update their own orders
    if (req.user.role === 'customer' && order.customerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    order.customerArrived = true;
    await order.save();

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant:${order.restaurantId}`).emit('order:updated', order);
      io.to(`order:${order._id}`).emit('order:updated', order);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};
