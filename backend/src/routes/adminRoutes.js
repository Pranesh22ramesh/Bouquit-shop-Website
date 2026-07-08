const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', protect, adminOnly, adminController.dashboardAnalytics);

module.exports = router;
