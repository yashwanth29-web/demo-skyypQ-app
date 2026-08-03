const express = require('express');
const router = express.Router();
const {
  registerCustomer, loginCustomer,
  registerOwner, loginOwner, getMe
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/verifyToken');

// Customer auth
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);

// Owner auth
router.post('/owner/register', registerOwner);
router.post('/owner/login', loginOwner);

// Get current user (any role)
router.get('/me', verifyToken, getMe);

module.exports = router;
