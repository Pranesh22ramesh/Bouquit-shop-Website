const express = require('express');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter, publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.get('/', publicLimiter, strictRequest({ query: ['userId', 'productId'] }), reviewController.listValidators, validateRequest, optionalAuth, reviewController.listReviews);

router.post(
  '/',
  protect,
  authenticatedLimiter,
  uploadLimiter,
  upload.single('image'),
  strictRequest({ body: ['rating', 'comment', 'author', 'productId'], bodyStrings: true }),
  reviewController.createValidators,
  validateRequest,
  reviewController.createReview
);

router.put(
  '/:id',
  protect,
  authenticatedLimiter,
  strictRequest({ body: ['rating', 'comment', 'userName', 'isHidden', 'isPinned'], params: ['id'] }),
  reviewController.updateValidators,
  validateRequest,
  reviewController.updateReview
);

router.delete(
  '/:id',
  protect,
  authenticatedLimiter,
  strictRequest({ params: ['id'] }),
  reviewController.reviewIdValidator,
  validateRequest,
  reviewController.deleteReview
);

module.exports = router;
