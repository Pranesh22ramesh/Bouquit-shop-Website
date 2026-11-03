const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const orderValidators = [
  body('orderItems')
    .isArray({ min: 1, max: 50 }).withMessage('Order must contain between 1 and 50 items'),
  body('orderItems.*.productId')
    .isString().withMessage('Product ID must be a string')
    .trim().notEmpty().withMessage('Product ID is required')
    .isLength({ max: 64 }).withMessage('Product ID is too long'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 100 }).withMessage('Item quantity must be between 1 and 100'),
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required'),
  body('paymentMethod')
    .isString().withMessage('Payment method must be a string')
    .trim().notEmpty().withMessage('Payment method is required')
    .isLength({ min: 2, max: 50 }).withMessage('Invalid payment method format'),
  body('itemsPrice')
    .isFloat({ min: 0 }).withMessage('Items price must be a non-negative number'),
  body('taxPrice')
    .isFloat({ min: 0 }).withMessage('Tax price must be a non-negative number'),
  body('shippingPrice')
    .isFloat({ min: 0 }).withMessage('Shipping price must be a non-negative number'),
  body('totalPrice')
    .isFloat({ min: 0 }).withMessage('Total price must be a non-negative number'),
  body('deliveryDate')
    .optional({ values: 'falsy' })
    .isISO8601().toDate().withMessage('Invalid delivery date format (ISO 8601 expected)'),
];

const orderIdValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('Order ID is required')
    .isLength({ min: 1, max: 64 }).withMessage('Invalid order ID format'),
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
