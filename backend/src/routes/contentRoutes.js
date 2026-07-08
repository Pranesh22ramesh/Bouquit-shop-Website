const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const contentController = require('../controllers/contentController');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/:key', contentController.getContent);
router.put('/:key', protect, adminOnly, upload.any(), contentController.updateContent);

module.exports = router;
