const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/categories', productController.listCategories);
router.get('/categories/list', productController.listCategories);

router.post(
  '/',
  protect,
  adminOnly,
  uploadLimiter,
  upload.single('image'),
  productController.productValidators,
  validateRequest,
  productController.createProduct
);

router.get('/:id', productController.productIdValidator, validateRequest, productController.getProductById);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadLimiter,
  upload.single('image'),
  productController.productIdValidator,
  productController.productValidators,
  validateRequest,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  productController.productIdValidator,
  validateRequest,
  productController.deleteProduct
);

module.exports = router;
