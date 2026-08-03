const express = require('express');
const router = express.Router();
const { getAnalytics, processPayout } = require('../controllers/analyticsController');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/:restaurantId', verifyToken, requireRole('owner'), getAnalytics);
router.post('/:restaurantId/payout', verifyToken, requireRole('owner'), processPayout);

module.exports = router;
