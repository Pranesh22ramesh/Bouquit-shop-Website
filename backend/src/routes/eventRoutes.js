const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/stream', protect, eventController.stream);

module.exports = router;
