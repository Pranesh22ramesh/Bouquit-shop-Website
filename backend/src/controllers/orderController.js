const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const orderValidators = [
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required'),
  body('shippingAddress.address')
    .isString().bail().trim().notEmpty().isLength({ min: 3, max: 180 }).withMessage('Enter a valid shipping address'),
  body('shippingAddress.city')
    .isString().bail().trim().notEmpty().isLength({ min: 2, max: 100 }).matches(/^[\p{L}\p{M} .'-]+$/u).withMessage('Enter a valid city'),
  body('shippingAddress.postalCode')
    .isString().bail().trim().notEmpty().isLength({ min: 3, max: 16 }).matches(/^[a-zA-Z0-9 -]+$/).withMessage('Enter a valid postal code'),
  body('shippingAddress.country')
    .isString().bail().trim().notEmpty().isLength({ min: 2, max: 100 }).matches(/^[\p{L}\p{M} .'-]+$/u).withMessage('Enter a valid country'),
  body('paymentMethod')
    .isString().bail()
    .equals('Cash on Delivery').withMessage('Cash on Delivery is the only available payment method'),
  body('deliveryDate')
    .optional()
    .isString().bail().isLength({ min: 10, max: 35 }).bail()
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('Invalid delivery date format (ISO 8601 expected)').bail().toDate(),
];

const orderIdValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('Order ID is required')
    .isUUID().withMessage('Invalid order ID format'),
];

const createOrder = asyncHandler(async (req, res) => {
  res.status(201).json(await orderService.createOrder(req.user.id, req.body));
});

const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await orderService.getMyOrders(req.user.id));
});

const getOrderById = asyncHandler(async (req, res) => {
  res.json(await orderService.getOrderById(req.user.id, req.user.role, req.params.id));
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  orderIdValidator,
  orderValidators,
};
