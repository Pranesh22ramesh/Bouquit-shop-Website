const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { strictRequest } = require('../middleware/strictRequest');
const { authenticatedLimiter } = require('../middleware/rateLimiter');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/stream', protect, authenticatedLimiter, strictRequest(), eventController.stream);

module.exports = router;
