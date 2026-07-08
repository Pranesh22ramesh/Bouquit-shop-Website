const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/categories/list', productController.listCategories);
router.post('/', protect, adminOnly, upload.single('image'), productController.productValidators, validateRequest, productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', protect, adminOnly, upload.single('image'), productController.productValidators, validateRequest, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
