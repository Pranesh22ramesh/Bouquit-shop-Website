const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const orderValidators = [
  body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('itemsPrice').isNumeric().withMessage('Items price is required'),
  body('taxPrice').isNumeric().withMessage('Tax price is required'),
  body('shippingPrice').isNumeric().withMessage('Shipping price is required'),
  body('totalPrice').isNumeric().withMessage('Total price is required'),
  body('deliveryDate').optional().isISO8601().toDate().withMessage('Invalid delivery date'),
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
  orderValidators,
};
