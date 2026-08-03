const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Restaurant = require('../models/Restaurant');

// ─── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── Customer: Register ───────────────────────────────────────────────────────
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required: name, email, phone, password' });
    }

    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({
        error: existing.email === email ? 'Email already registered' : 'Phone number already registered',
      });
    }

    const customer = new Customer({ name, email, phone, passwordHash: password });
    await customer.save();

    const token = signToken({ id: customer._id, role: 'customer' });

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Customer: Login ──────────────────────────────────────────────────────────
exports.loginCustomer = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const customer = await Customer.findOne({ phone }).select('+passwordHash');
    if (!customer) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = signToken({ id: customer._id, role: 'customer' });

    res.json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Owner: Register ──────────────────────────────────────────────────────────
exports.registerOwner = async (req, res, next) => {
  try {
    const { restaurantId, username, password } = req.body;

    if (!restaurantId || !username || !password) {
      return res.status(400).json({ error: 'restaurantId, username, and password are required' });
    }

    const restaurant = await Restaurant.findOne({ id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerUsername) {
      return res.status(409).json({ error: 'This restaurant already has an owner account' });
    }

    const usernameExists = await Restaurant.findOne({ ownerUsername: username });
    if (usernameExists) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    restaurant.ownerUsername = username;
    restaurant.ownerPasswordHash = password; // pre-save hook hashes it
    await restaurant.save();

    const token = signToken({ id: restaurant._id, restaurantId: restaurant.id, role: 'owner' });

    res.status(201).json({
      token,
      owner: {
        username: restaurant.ownerUsername,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Owner: Login ─────────────────────────────────────────────────────────────
exports.loginOwner = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const restaurant = await Restaurant.findOne({ ownerUsername: username }).select('+ownerPasswordHash');
    if (!restaurant) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await restaurant.compareOwnerPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({ id: restaurant._id, restaurantId: restaurant.id, role: 'owner' });

    res.json({
      token,
      owner: {
        username: restaurant.ownerUsername,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User (me) ────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'customer') {
      const customer = await Customer.findById(req.user.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      return res.json({ role: 'customer', user: customer });
    }

    if (req.user.role === 'owner') {
      const restaurant = await Restaurant.findOne({ id: req.user.restaurantId });
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      return res.json({
        role: 'owner',
        user: {
          username: restaurant.ownerUsername,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        },
      });
    }

    res.status(400).json({ error: 'Unknown role' });
  } catch (err) {
    next(err);
  }
};
