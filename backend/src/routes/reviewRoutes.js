const express = require('express');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter, publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.get('/', publicLimiter, optionalAuth, reviewController.listReviews);

router.post(
  '/',
  protect,
  authenticatedLimiter,
  uploadLimiter,
  upload.single('image'),
  reviewController.createValidators,
  validateRequest,
  reviewController.createReview
);

router.put(
  '/:id',
  protect,
  authenticatedLimiter,
  reviewController.updateValidators,
  validateRequest,
  reviewController.updateReview
);

router.delete(
  '/:id',
  protect,
  authenticatedLimiter,
  reviewController.reviewIdValidator,
  validateRequest,
  reviewController.deleteReview
);

module.exports = router;
