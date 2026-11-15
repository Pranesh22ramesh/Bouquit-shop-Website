const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { authenticatedLimiter } = require('../middleware/rateLimiter');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(protect, authenticatedLimiter);

router.post('/', strictRequest({ body: ['shippingAddress', 'paymentMethod', 'deliveryDate'], nestedBody: { shippingAddress: ['address', 'city', 'postalCode', 'country'] } }), orderController.orderValidators, validateRequest, orderController.createOrder);
router.get('/myorders', strictRequest(), orderController.getMyOrders);
router.get('/:id', strictRequest({ params: ['id'] }), orderController.orderIdValidator, validateRequest, orderController.getOrderById);

module.exports = router;
