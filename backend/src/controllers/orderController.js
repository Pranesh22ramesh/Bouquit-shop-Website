const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const orderValidators = [
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required'),
  body('shippingAddress.address')
    .isString().bail().trim().notEmpty().isLength({ max: 180 }).withMessage('Enter a valid shipping address'),
  body('shippingAddress.city')
    .isString().bail().trim().notEmpty().isLength({ max: 180 }).withMessage('Enter a valid city'),
  body('shippingAddress.postalCode')
    .isString().bail().trim().notEmpty().isLength({ max: 40 }).withMessage('Enter a valid postal code'),
  body('shippingAddress.country')
    .isString().bail().trim().notEmpty().isLength({ max: 100 }).withMessage('Enter a valid country'),
  body('paymentMethod')
    .equals('Cash on Delivery').withMessage('Cash on Delivery is the only available payment method'),
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
