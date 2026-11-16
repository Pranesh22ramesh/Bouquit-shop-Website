const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter, publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const productController = require('../controllers/productController');

const router = express.Router();
router.use((req, res, next) => ['GET', 'HEAD'].includes(req.method) ? publicLimiter(req, res, next) : next());

router.get('/', strictRequest({ query: ['keyword', 'search', 'category', 'filter', 'sort', 'limit', 'featured', 'status'] }), productController.productListValidators, validateRequest, productController.listProducts);
router.get('/categories', strictRequest(), productController.listCategories);
router.get('/categories/list', strictRequest(), productController.listCategories);

router.post(
  '/',
  protect,
  adminOnly,
  authenticatedLimiter,
  uploadLimiter,
  upload.single('image'),
  strictRequest({ body: ['name', 'category', 'price', 'offerPrice', 'description', 'badge', 'status', 'availability', 'productStatus', 'customizedAvailable', 'featured'], bodyStrings: true }),
  productController.productValidators,
  validateRequest,
  productController.createProduct
);

router.get('/:id', strictRequest({ params: ['id'] }), productController.productIdValidator, validateRequest, productController.getProductById);

router.put(
  '/:id',
  protect,
  adminOnly,
  authenticatedLimiter,
  uploadLimiter,
  upload.single('image'),
  strictRequest({ body: ['name', 'category', 'price', 'offerPrice', 'description', 'badge', 'status', 'availability', 'productStatus', 'customizedAvailable', 'featured'], params: ['id'], bodyStrings: true }),
  productController.productIdValidator,
  productController.productValidators,
  validateRequest,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  authenticatedLimiter,
  strictRequest({ params: ['id'] }),
  productController.productIdValidator,
  validateRequest,
  productController.deleteProduct
);

module.exports = router;
