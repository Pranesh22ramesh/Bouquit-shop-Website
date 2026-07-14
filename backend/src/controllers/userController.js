const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');

const profileValidators = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name is required'),
  body('name').optional().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('phoneNumber').optional({ values: 'falsy' }).isLength({ min: 10, max: 20 }).withMessage('Enter a valid phone number'),
  body('mobile').optional({ values: 'falsy' }).isLength({ min: 10, max: 20 }).withMessage('Enter a valid phone number'),
  body('address').optional({ values: 'falsy' }).isString(),
  body('password').optional({ values: 'falsy' }).isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

const passwordValidators = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

const cartValidators = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartValidators = [
  body('itemId').notEmpty().withMessage('Cart item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const idParamValidator = [param('id').notEmpty().withMessage('ID is required')];

const getUsers = asyncHandler(async (req, res) => {
  res.json(
    await userService.getAllUsers({
      search: req.query.search,
      role: req.query.role === 'admin' ? 'ADMIN' : req.query.role === 'user' ? 'USER' : undefined,
      status: req.query.status,
    })
  );
});

const getUserById = asyncHandler(async (req, res) => {
  res.json(await userService.getUserById(req.params.id));
});

const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user.id, {
    fullName: req.body.fullName || req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber || req.body.mobile,
    address: req.body.address,
    password: req.body.password,
  });
  res.json(updated);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

const updatePassword = asyncHandler(async (req, res) => {
  await userService.updateUserPassword(req.params.id, req.body.password);
  res.json({ message: 'Password updated successfully' });
});

const getActivities = asyncHandler(async (req, res) => {
  res.json(await userService.getActivities(req.user.id));
});

const getUserActivities = asyncHandler(async (req, res) => {
  res.json(await userService.getActivitiesByUserId(req.params.id));
});

const getCart = asyncHandler(async (req, res) => {
  res.json(await userService.getCart(req.user.id));
});

const addToCart = asyncHandler(async (req, res) => {
  res.status(201).json(await userService.addCartItem(req.user.id, req.body));
});

const updateCart = asyncHandler(async (req, res) => {
  res.json(await userService.updateCartItem(req.user.id, req.body));
});

const removeCart = asyncHandler(async (req, res) => {
  res.json(await userService.removeCartItem(req.user.id, req.params.id));
});

const toggleLike = asyncHandler(async (req, res) => {
  res.json(await userService.toggleLike(req.user.id, req.params.id));
});

const getWishlist = asyncHandler(async (req, res) => {
  res.json(await userService.getWishlist(req.user.id));
});

const toggleWishlist = asyncHandler(async (req, res) => {
  res.json(await userService.toggleWishlist(req.user.id, req.params.id));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const updated = await userService.setUserStatus(req.params.id, req.body.isActive);
  res.json({
    message: updated.isActive ? 'User enabled successfully' : 'User disabled successfully',
    isActive: updated.isActive,
  });
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  const updatedUser = await userService.adminUpdateUserDetails(req.user.id, req.params.id, {
    fullName: req.body.fullName || req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber || req.body.mobile,
    password: req.body.password,
    role: req.body.role,
  });
  res.json({ message: 'User details updated successfully', user: updatedUser });
});

module.exports = {
  addToCart,
  adminUpdateUser,
  cartValidators,
  deleteUser,
  getActivities,
  getUserActivities,
  getUserById,
  getCart,
  getUsers,
  getWishlist,
  idParamValidator,
  passwordValidators,
  profileValidators,
  removeCart,
  toggleLike,
  toggleWishlist,
  updateCart,
  updateCartValidators,
  updatePassword,
  updateUserStatus,
  updateProfile,
};
