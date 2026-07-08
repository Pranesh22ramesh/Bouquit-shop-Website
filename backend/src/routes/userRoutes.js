const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, adminOnly, userController.getUsers);
router.get('/activities', protect, userController.getActivities);
router.put('/profile', protect, userController.profileValidators, validateRequest, userController.updateProfile);
router.get('/cart', protect, userController.getCart);
router.post('/cart', protect, userController.cartValidators, validateRequest, userController.addToCart);
router.put('/cart', protect, userController.updateCartValidators, validateRequest, userController.updateCart);
router.delete('/cart/:id', protect, userController.idParamValidator, validateRequest, userController.removeCart);
router.post('/likes/:id', protect, userController.idParamValidator, validateRequest, userController.toggleLike);
router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist/:id', protect, userController.idParamValidator, validateRequest, userController.toggleWishlist);
router.get('/:id/activities', protect, adminOnly, userController.idParamValidator, validateRequest, userController.getUserActivities);
router.patch('/:id/status', protect, adminOnly, userController.idParamValidator, validateRequest, userController.updateUserStatus);
router.put('/:id/password', protect, adminOnly, userController.idParamValidator.concat(userController.passwordValidators), validateRequest, userController.updatePassword);
router.get('/:id', protect, adminOnly, userController.idParamValidator, validateRequest, userController.getUserById);
router.delete('/:id', protect, adminOnly, userController.idParamValidator, validateRequest, userController.deleteUser);

module.exports = router;
