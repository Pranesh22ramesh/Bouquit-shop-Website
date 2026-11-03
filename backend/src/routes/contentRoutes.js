const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter, publicLimiter } = require('../middleware/rateLimiter');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/:key', publicLimiter, contentController.contentKeyValidator, validateRequest, contentController.getContent);

router.put(
  '/:key',
  protect,
  adminOnly,
  uploadLimiter,
  upload.any(),
  contentController.contentKeyValidator,
  validateRequest,
  contentController.updateContent
);

module.exports = router;
