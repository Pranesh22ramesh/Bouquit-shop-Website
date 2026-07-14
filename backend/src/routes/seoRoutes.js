// src/routes/seoRoutes.js
const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const seoController = require('../controllers/seoController');

const router = express.Router();

// Public endpoints
router.get('/config', seoController.getConfig);
router.get('/sitemap.xml', seoController.getSitemap);
router.get('/robots.txt', seoController.getRobots);
router.get('/pages', seoController.getAllPages);
router.get('/pages/:pageKey', seoController.getPage);

// Admin-protected endpoints
router.put('/config', protect, adminOnly, seoController.updateConfig);
router.put('/pages/:pageKey', protect, adminOnly, seoController.upsertPage);
router.get('/health', protect, adminOnly, seoController.getHealthCheck);

module.exports = router;
