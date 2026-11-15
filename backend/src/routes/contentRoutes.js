const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter, publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/:key', publicLimiter, strictRequest({ params: ['key'] }), contentController.contentKeyValidator, validateRequest, contentController.getContent);

router.put(
  '/:key',
  protect,
  adminOnly,
  authenticatedLimiter,
  uploadLimiter,
  upload.any(),
  strictRequest({ body: ['data'], params: ['key'], bodyStrings: true }),
  contentController.contentKeyValidator,
  validateRequest,
  contentController.updateContent
);

module.exports = router;
