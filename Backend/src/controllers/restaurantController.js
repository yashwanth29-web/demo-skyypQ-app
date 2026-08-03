const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const QRCode = require('qrcode');

// ─── Get All Restaurants ──────────────────────────────────────────────────────
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find(
      {},
      { ownerPasswordHash: 0, ownerUsername: 0 } // exclude sensitive fields
    ).lean();
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Restaurant ────────────────────────────────────────────────────
exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne(
      { id: req.params.id },
      { ownerPasswordHash: 0, ownerUsername: 0 }
    ).lean();

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

// ─── Get Menu for a Restaurant ────────────────────────────────────────────────
exports.getMenuByRestaurantId = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.id }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// ─── Generate QR Code for Restaurant (Owner only) ────────────────────────────
exports.getRestaurantQR = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure the owner only generates QR for their own restaurant
    if (req.user.role === 'owner' && req.user.restaurantId !== id) {
      return res.status(403).json({ error: 'Access denied: not your restaurant' });
    }

    const customerAppUrl = process.env.CUSTOMER_APP_URL || 'http://localhost:5173';
    const qrUrl = `${customerAppUrl}/r/${id}`;

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
    });

    res.json({ qrUrl, qrDataUrl });
  } catch (err) {
    next(err);
  }
};

// ─── Update Restaurant Profile (Owner only) ───────────────────────────────────
exports.updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'owner' && req.user.restaurantId !== id) {
      return res.status(403).json({ error: 'Access denied: not your restaurant' });
    }

    const allowedUpdates = ['name', 'address', 'cuisine', 'valetEnabled', 'image'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const restaurant = await Restaurant.findOneAndUpdate(
      { id },
      updates,
      { new: true, select: '-ownerPasswordHash -ownerUsername' }
    ).lean();

    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};
