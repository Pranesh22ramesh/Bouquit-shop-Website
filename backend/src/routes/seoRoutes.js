// src/routes/seoRoutes.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { publicLimiter, authenticatedLimiter } = require('../middleware/rateLimiter');
const seoController = require('../controllers/seoController');

const router = express.Router();

// Public endpoints
router.get('/config', publicLimiter, strictRequest(), seoController.getConfig);
router.get('/sitemap.xml', publicLimiter, strictRequest(), seoController.getSitemap);
router.get('/robots.txt', publicLimiter, strictRequest(), seoController.getRobots);
router.get('/pages', publicLimiter, strictRequest(), seoController.getAllPages);
router.get('/pages/:pageKey', publicLimiter, strictRequest({ params: ['pageKey'] }), seoController.pageKeyValidator, validateRequest, seoController.getPage);

// Admin-protected endpoints
router.put('/config', protect, authenticatedLimiter, adminOnly, strictRequest({ body: ['siteTitle', 'siteDescription', 'defaultOgImage'] }), seoController.updateConfigValidators, validateRequest, seoController.updateConfig);
router.put('/pages/:pageKey', protect, authenticatedLimiter, adminOnly, strictRequest({ body: ['title', 'description', 'canonical'], params: ['pageKey'] }), seoController.upsertPageValidators, validateRequest, seoController.upsertPage);
router.get('/health', protect, authenticatedLimiter, adminOnly, strictRequest(), seoController.getHealthCheck);

module.exports = router;
