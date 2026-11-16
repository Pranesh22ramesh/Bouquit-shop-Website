const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const reviewService = require('../services/reviewService');

const createValidators = [
  body('rating')
    .custom((value, { req }) => req.is('multipart/form-data') ? typeof value === 'string' : typeof value === 'number')
    .withMessage('Rating has an invalid type').bail()
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .isString().bail()
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 3, max: 1000 }).withMessage('Comment must be between 3 and 1000 characters'),
  body('author')
    .optional()
    .isString().bail()
    .trim()
    .isLength({ min: 2, max: 70 }).withMessage('Author name must be between 2 and 70 characters'),
  body('productId')
    .optional()
    .isString().bail()
    .trim()
    .isUUID().withMessage('Invalid product ID format'),
];

const listValidators = [
  query('userId').optional().isUUID().withMessage('Invalid user ID format'),
  query('productId').optional().isUUID().withMessage('Invalid product ID format'),
];

const reviewIdValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('Review ID is required')
    .isUUID().withMessage('Invalid review ID format'),
];

const updateValidators = [
  ...reviewIdValidator,
  body('rating')
    .custom((value) => typeof value === 'number').withMessage('Rating must be a number').bail()
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .isString().bail()
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 3, max: 1000 }).withMessage('Comment must be between 3 and 1000 characters'),
  body('userName').optional().isString().bail().trim().isLength({ min: 2, max: 70 }).withMessage('Name must be between 2 and 70 characters'),
  body('isHidden').optional().custom((value) => typeof value === 'boolean').bail().custom((_, { req }) => req.user.role === 'ADMIN').withMessage('Only administrators may change review visibility'),
  body('isPinned').optional().custom((value) => typeof value === 'boolean').bail().custom((_, { req }) => req.user.role === 'ADMIN').withMessage('Only administrators may pin reviews'),
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
  listValidators,
  deleteReview,
  listReviews,
  reviewIdValidator,
  updateReview,
  updateValidators,
};
