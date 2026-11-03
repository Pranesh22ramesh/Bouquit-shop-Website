// src/controllers/seoController.js
const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const seoService = require('../services/seoService');

const pageKeyValidator = [
  param('pageKey')
    .trim()
    .notEmpty().withMessage('Page key is required')
    .matches(/^[a-z0-9_-]{2,60}$/).withMessage('Invalid page key format (alphanumeric, hyphens and underscores only)'),
];

const updateConfigValidators = [
  body('siteTitle')
    .optional()
    .trim()
    .isString().withMessage('Site title must be a string')
    .isLength({ max: 120 }).withMessage('Site title must not exceed 120 characters'),
  body('siteDescription')
    .optional()
    .trim()
    .isString().withMessage('Site description must be a string')
    .isLength({ max: 500 }).withMessage('Site description must not exceed 500 characters'),
  body('defaultOgImage')
    .optional()
    .trim()
    .isString().withMessage('Default OG image must be a string')
    .isLength({ max: 500 }).withMessage('Image URL too long'),
];

const upsertPageValidators = [
  ...pageKeyValidator,
  body('title')
    .optional()
    .trim()
    .isString().withMessage('Title must be a string')
    .isLength({ max: 120 }).withMessage('Title must not exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('canonical')
    .optional()
    .trim()
    .isString().withMessage('Canonical URL must be a string')
    .isLength({ max: 300 }).withMessage('Canonical URL too long'),
];

const getConfig = asyncHandler(async (req, res) => {
  const config = await seoService.getConfig();
  res.json({ config });
});

const updateConfig = asyncHandler(async (req, res) => {
  const config = await seoService.updateConfig(req.body);
  res.json({ message: 'SEO configuration updated', config });
});

const getAllPages = asyncHandler(async (req, res) => {
  const pages = await seoService.getAllPages();
  res.json({ pages });
});

const getPage = asyncHandler(async (req, res) => {
  const page = await seoService.getPage(req.params.pageKey);
  if (!page) return res.status(404).json({ message: 'Page SEO not found' });
  res.json({ page });
});

const upsertPage = asyncHandler(async (req, res) => {
  const page = await seoService.upsertPage(req.params.pageKey, req.body);
  res.json({ message: 'Page SEO updated', page });
});

const getSitemap = asyncHandler(async (req, res) => {
  const xml = await seoService.generateSitemap();
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

const getRobots = asyncHandler(async (req, res) => {
  const robots = await seoService.generateRobots();
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(robots);
});

const getHealthCheck = asyncHandler(async (req, res) => {
  const health = await seoService.getSeoHealthCheck();
  res.json({ health });
});

module.exports = {
  getConfig,
  getHealthCheck,
  getPage,
  getRobots,
  getSitemap,
  getAllPages,
  pageKeyValidator,
  updateConfig,
  updateConfigValidators,
  upsertPage,
  upsertPageValidators,
};
