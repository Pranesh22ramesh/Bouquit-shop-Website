const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const productService = require('../services/productService');
const { logActivity } = require('../services/activityService');

const productValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Product name must be between 2 and 120 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 2, max: 60 }).withMessage('Category must be between 2 and 60 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isLength({ max: 12 }).withMessage('Price is too large')
    .bail()
    .isFloat({ min: 0, max: 10000000 }).withMessage('Price must be a valid non-negative amount'),
  body('offerPrice')
    .optional({ values: 'falsy' })
    .isLength({ max: 12 }).withMessage('Offer price is too large')
    .bail()
    .isFloat({ min: 0, max: 10000000 }).withMessage('Offer price must be a valid non-negative amount'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 3000 }).withMessage('Description must not exceed 3000 characters'),
  body('badge')
    .optional()
    .isIn(['NORMAL', 'NEW_ARRIVAL', 'OFFER', 'Normal', 'New Arrival', 'Offer'])
    .withMessage('Invalid product badge'),
  body('availability')
    .optional()
    .isIn(['AVAILABLE', 'UNAVAILABLE', 'Available', 'Unavailable'])
    .withMessage('Invalid availability status'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'UNAVAILABLE', 'Available', 'Unavailable'])
    .withMessage('Invalid availability status'),
  body('productStatus')
    .optional()
    .isIn(['NORMAL', 'NEW_ARRIVAL', 'OFFER', 'Normal', 'New Arrival', 'Offer'])
    .withMessage('Invalid product badge'),
  body('featured').optional().isBoolean({ strict: true }).withMessage('Featured must be a boolean value'),
  body('customizedAvailable').optional().isBoolean({ strict: true }).withMessage('Customized available must be a boolean value'),
];

const productListValidators = [
  query('keyword').optional().isString().isLength({ max: 100 }).withMessage('Keyword must not exceed 100 characters'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search must not exceed 100 characters'),
  query('category').optional().isString().isLength({ max: 60 }).withMessage('Category must not exceed 60 characters'),
  query('filter').optional().isIn(['all', 'latest', 'high-selling', 'offered', 'combo']).withMessage('Invalid product filter'),
  query('sort').optional().isIn(['latest', 'oldest', 'price-low', 'price-high', 'name-asc', 'high-selling']).withMessage('Invalid product sort order'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('featured').optional().isIn(['true', 'false']).withMessage('Featured must be true or false'),
  query('status').optional().isIn(['available', 'unavailable']).withMessage('Invalid product status'),
];

const productIdValidator = [
  param('id')
    .trim()
    .notEmpty().withMessage('Product ID is required')
    .isUUID().withMessage('Invalid product ID format'),
];

const listProducts = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  const products = await productService.listProducts(req.query);
  if (req.baseUrl.endsWith('/gallery')) {
    return res.json({
      products,
      totalProducts: products.length,
      currentPage: 1,
      totalPages: 1,
    });
  }
  return res.json(products);
});

const listCategories = asyncHandler(async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(await productService.listCategories());
});

const getProductById = asyncHandler(async (req, res) => {
  res.json(await productService.getProductById(req.params.id));
});

const createProduct = asyncHandler(async (req, res) => {
  const created = await productService.createProduct(req.body, req.file);
  await logActivity({
    userId: req.user.id,
    action: 'product_created',
    resourceType: 'product',
    resourceId: created._id,
    details: { name: created.name, category: created.category },
  });
  res.status(201).json(created);
});

const updateProduct = asyncHandler(async (req, res) => {
  const updated = await productService.updateProduct(req.params.id, req.body, req.file);
  await logActivity({
    userId: req.user.id,
    action: 'product_updated',
    resourceType: 'product',
    resourceId: updated._id,
    details: { name: updated.name, category: updated.category },
  });
  res.json(updated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  await logActivity({
    userId: req.user.id,
    action: 'product_deleted',
    resourceType: 'product',
    resourceId: req.params.id,
    details: null,
  });
  res.json({ message: 'Product Deleted Successfully' });
});

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  listProducts,
  productIdValidator,
  productValidators,
  productListValidators,
  updateProduct,
};
