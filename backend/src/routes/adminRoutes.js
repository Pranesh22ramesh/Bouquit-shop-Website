const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { strictRequest } = require('../middleware/strictRequest');
const { authenticatedLimiter } = require('../middleware/rateLimiter');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', protect, authenticatedLimiter, adminOnly, strictRequest(), adminController.dashboardAnalytics);

module.exports = router;
