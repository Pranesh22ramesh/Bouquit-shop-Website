const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const reviewService = require('../services/reviewService');

const createValidators = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
  body('author').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Author is required'),
  body('productId').optional({ values: 'falsy' }).isUUID().withMessage('Invalid product ID'),
];

const updateValidators = [
  param('id').notEmpty().withMessage('Review ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

const listReviews = asyncHandler(async (req, res) => {
  res.json(
    await reviewService.listReviews({
      userId: req.query.userId || null,
      productId: req.query.productId || null,
      includeHidden: req.user?.role === 'ADMIN',
    })
  );
});

const createReview = asyncHandler(async (req, res) => {
  res.status(201).json(await reviewService.createReview(req.user, req.body, req.file));
});

const updateReview = asyncHandler(async (req, res) => {
  res.json(await reviewService.updateReview(req.user, req.params.id, req.body));
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user, req.params.id);
  res.json({ message: 'Review deleted successfully' });
});

module.exports = {
  createReview,
  createValidators,
  deleteReview,
  listReviews,
  updateReview,
  updateValidators,
};
