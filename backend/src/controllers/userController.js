const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');

const profileValidators = [
  body('fullName')
    .optional()
    .isString().bail()
    .trim()
    .isLength({ min: 2, max: 70 })
    .matches(/^[\p{L}\p{M}\s.'-]+$/u).withMessage('Full name contains invalid characters'),
  body('name')
    .optional()
    .isString().bail()
    .trim()
    .isLength({ min: 2, max: 70 })
    .matches(/^[\p{L}\p{M}\s.'-]+$/u).withMessage('Full name contains invalid characters'),
  body('email')
    .optional()
    .isString().bail()
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email address is too long'),
  body('phoneNumber')
    .optional()
    .isString().bail()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number (10 to 15 digits)'),
  body('mobile')
    .optional()
    .isString().bail()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number (10 to 15 digits)'),
  body('address')
    .optional()
    .isString().withMessage('Address must be a string').bail()
    .isLength({ max: 300 }).withMessage('Address must not exceed 300 characters'),
  body('password')
    .optional()
    .isString().withMessage('Password must be a string').bail()
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must not exceed 72 UTF-8 bytes')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
];

const userListValidators = [
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search text must not exceed 100 characters'),
  query('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  query('status').optional().isIn(['active', 'disabled']).withMessage('Status must be active or disabled'),
];

const adminProfileValidators = [
  ...profileValidators,
  body('role').optional().isString().bail().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
];

const passwordValidators = [
  body('password')
    .isString().withMessage('Password must be a string')
    .bail().custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must not exceed 72 UTF-8 bytes')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
];

const cartValidators = [
  body('productId')
    .isString().bail()
    .trim()
    .notEmpty().withMessage('Product ID is required')
    .isUUID().withMessage('Invalid product ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .custom((value) => typeof value === 'number').withMessage('Quantity must be a number')
    .bail()
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
  body('customization')
    .optional()
    .isObject({ strict: true }).withMessage('Customization must be an object').bail()
    .custom((value) => {
      const allowed = new Set(['variant', 'primaryColor', 'secondaryColors', 'selectedFlowers', 'stones', 'notes', 'referenceImageName', 'mainColor', 'secondaryColor', 'beads', 'hasReferencePhoto', 'quantity']);
      if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error('Unsupported customization field');
      for (const [key, entry] of Object.entries(value)) {
        if (key === 'quantity') {
          if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 1 || entry > 99) throw new Error('Customization quantity is invalid');
        } else if (key === 'stones' && typeof entry === 'boolean') {
          continue;
        } else if (key === 'secondaryColors' && typeof entry === 'string') {
          if (entry.length > 40) throw new Error('Customization color is too long');
        } else if (['secondaryColors', 'selectedFlowers', 'stones'].includes(key)) {
          if (!Array.isArray(entry) || entry.length > 20 || entry.some((item) => typeof item !== 'string' || item.length > 40)) throw new Error('Invalid customization option list');
        } else if (['beads', 'hasReferencePhoto'].includes(key)) {
          if (typeof entry !== 'boolean') throw new Error('Customization flags must be boolean');
        } else if (entry !== null && (typeof entry !== 'string' || entry.length > 500)) {
          throw new Error('Customization values must be short strings');
        }
        if (['mainColor', 'secondaryColor'].includes(key) && (typeof entry !== 'string' || !/^#[0-9a-f]{6}$/i.test(entry))) throw new Error('Invalid color format');
        if (key === 'variant' && entry !== null && !['classic', 'premium', 'luxury'].includes(entry)) throw new Error('Invalid variant');
        if (key === 'primaryColor' && !['Classic Red', 'Soft Pastel', 'Ivory & Gold', 'Multicolor'].includes(entry)) throw new Error('Invalid primary color');
        if (key === 'secondaryColors' && (!Array.isArray(entry) || entry.length > 6 || entry.some((color) => !['Classic Red', 'Soft Pastel', 'Ivory & Gold'].includes(color)))) throw new Error('Invalid secondary colors');
        if (key === 'stones' && Array.isArray(entry) && entry.some((stone) => !['Crystals', 'Pearl Beads', 'Kundan Highlights'].includes(stone))) throw new Error('Invalid stone option');
        if (key === 'selectedFlowers' && Array.isArray(entry) && entry.some((flower) => !/^[\p{L}\p{M} .'-]{1,40}$/u.test(flower))) throw new Error('Invalid flower name');
        if (key === 'referenceImageName' && entry !== null && entry.length > 120) throw new Error('Reference filename is too long');
      }
      return true;
    }),
];

const updateCartValidators = [
  body('itemId')
    .isString().bail()
    .trim()
    .notEmpty().withMessage('Cart item ID is required')
    .isUUID().withMessage('Invalid cart item ID format'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .custom((value) => typeof value === 'number').withMessage('Quantity must be a number')
    .bail()
    .isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
];

const statusValidators = [
  body('isActive').optional().custom((value) => typeof value === 'boolean').withMessage('isActive must be a boolean value'),
  body('status').optional().isString().bail().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']).withMessage('Invalid status value'),
  body().custom((value) => {
    if (value.isActive === undefined && value.status === undefined) throw new Error('A status value is required');
    if (value.isActive !== undefined && value.status !== undefined) throw new Error('Provide one status field');
    return true;
  }),
];

const idParamValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID parameter is required')
    .isUUID().withMessage('Invalid ID format'),
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
  const isActive = req.body.isActive ?? req.body.status === 'ACTIVE';
  const updated = await userService.setUserStatus(req.params.id, isActive);
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
  adminProfileValidators,
  userListValidators,
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
