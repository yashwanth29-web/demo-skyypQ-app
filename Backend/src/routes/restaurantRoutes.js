const express = require('express');
const router = express.Router();
const {
  getAllRestaurants, getRestaurantById,
  getMenuByRestaurantId, getRestaurantQR, updateRestaurant
} = require('../controllers/restaurantController');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

// Public routes (no auth required for browsing)
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getMenuByRestaurantId);

// Owner-only routes
router.get('/:id/qr', verifyToken, requireRole('owner'), getRestaurantQR);
router.patch('/:id', verifyToken, requireRole('owner'), updateRestaurant);

module.exports = router;
