// src/routes/seoRoutes.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const seoController = require('../controllers/seoController');

const router = express.Router();

// Public endpoints
router.get('/config', publicLimiter, seoController.getConfig);
router.get('/sitemap.xml', publicLimiter, seoController.getSitemap);
router.get('/robots.txt', publicLimiter, seoController.getRobots);
router.get('/pages', publicLimiter, seoController.getAllPages);
router.get('/pages/:pageKey', publicLimiter, seoController.pageKeyValidator, validateRequest, seoController.getPage);

// Admin-protected endpoints
router.put('/config', protect, adminOnly, authenticatedLimiter, seoController.updateConfigValidators, validateRequest, seoController.updateConfig);
router.put('/pages/:pageKey', protect, adminOnly, authenticatedLimiter, seoController.upsertPageValidators, validateRequest, seoController.upsertPage);
router.get('/health', protect, adminOnly, authenticatedLimiter, seoController.getHealthCheck);

module.exports = router;
