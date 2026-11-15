const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { authenticatedLimiter } = require('../middleware/rateLimiter');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(protect, authenticatedLimiter);

router.get('/', adminOnly, strictRequest({ query: ['search', 'role', 'status'] }), userController.userListValidators, validateRequest, userController.getUsers);
router.get('/activities', strictRequest(), userController.getActivities);
router.put('/profile', strictRequest({ body: ['fullName', 'name', 'email', 'phoneNumber', 'mobile', 'address', 'password'] }), userController.profileValidators, validateRequest, userController.updateProfile);
router.get('/cart', strictRequest(), userController.getCart);
router.post('/cart', strictRequest({ body: ['productId', 'quantity', 'customization'], nestedBody: { customization: ['variant', 'primaryColor', 'secondaryColors', 'selectedFlowers', 'stones', 'notes', 'referenceImageName', 'mainColor', 'secondaryColor', 'beads', 'hasReferencePhoto', 'quantity'] } }), userController.cartValidators, validateRequest, userController.addToCart);
router.put('/cart', strictRequest({ body: ['itemId', 'quantity'] }), userController.updateCartValidators, validateRequest, userController.updateCart);
router.delete('/cart/:id', strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.removeCart);
router.post('/likes/:id', strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.toggleLike);
router.get('/wishlist', strictRequest(), userController.getWishlist);
router.post('/wishlist/:id', strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.toggleWishlist);
router.get('/:id/activities', adminOnly, strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.getUserActivities);
router.patch('/:id/status', adminOnly, strictRequest({ body: ['isActive', 'status'], params: ['id'] }), userController.idParamValidator, userController.statusValidators, validateRequest, userController.updateUserStatus);
router.put('/:id/password', adminOnly, strictRequest({ body: ['password'], params: ['id'] }), userController.idParamValidator, userController.passwordValidators, validateRequest, userController.updatePassword);
router.get('/:id', adminOnly, strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.getUserById);
router.put('/:id', adminOnly, strictRequest({ body: ['fullName', 'name', 'email', 'phoneNumber', 'mobile', 'password', 'role'], params: ['id'] }), userController.idParamValidator, userController.adminProfileValidators, validateRequest, userController.adminUpdateUser);
router.delete('/:id', adminOnly, strictRequest({ params: ['id'] }), userController.idParamValidator, validateRequest, userController.deleteUser);

module.exports = router;
