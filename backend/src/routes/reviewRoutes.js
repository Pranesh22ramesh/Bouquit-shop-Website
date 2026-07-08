const express = require('express');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.get('/', optionalAuth, reviewController.listReviews);
router.post('/', protect, upload.single('image'), reviewController.createValidators, validateRequest, reviewController.createReview);
router.put('/:id', protect, reviewController.updateValidators, validateRequest, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
