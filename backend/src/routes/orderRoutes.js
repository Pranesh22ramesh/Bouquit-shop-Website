const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, orderController.orderValidators, validateRequest, orderController.createOrder);
router.get('/myorders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);

module.exports = router;
