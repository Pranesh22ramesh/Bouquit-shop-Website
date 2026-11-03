const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');

const profileValidators = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 70 }).withMessage('Full name must be between 2 and 70 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 70 }).withMessage('Full name must be between 2 and 70 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email address is too long'),
  body('phoneNumber')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number (10 to 15 digits)'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number (10 to 15 digits)'),
  body('address')
    .optional({ values: 'falsy' })
    .isString().withMessage('Address must be a string')
    .isLength({ max: 300 }).withMessage('Address must not exceed 300 characters'),
  body('password')
    .optional({ values: 'falsy' })
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
];

const passwordValidators = [
  body('password')
    .isString().withMessage('Password must be a string')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
];

const cartValidators = [
  body('productId')
    .trim()
    .notEmpty().withMessage('Product ID is required')
    .isLength({ min: 1, max: 64 }).withMessage('Invalid product ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
];

const updateCartValidators = [
  body('itemId')
    .trim()
    .notEmpty().withMessage('Cart item ID is required')
    .isLength({ min: 1, max: 64 }).withMessage('Invalid cart item ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
];

const statusValidators = [
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Invalid status value'),
];

const idParamValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID parameter is required')
    .isLength({ min: 1, max: 64 }).withMessage('Invalid ID format'),
];

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
  statusValidators,
  toggleLike,
  toggleWishlist,
  updateCart,
  updateCartValidators,
  updatePassword,
  updateUserStatus,
  updateProfile,
};
