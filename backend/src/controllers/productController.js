const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const productService = require('../services/productService');
const { logActivity } = require('../services/activityService');

const productValidators = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price is required'),
];

const listProducts = asyncHandler(async (req, res) => {
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
  productValidators,
  updateProduct,
};
