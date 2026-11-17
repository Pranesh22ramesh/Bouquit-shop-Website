// src/controllers/seoController.js
const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const seoService = require('../services/seoService');
const { isSafeUrl } = require('../utils/safeUrl');

const pageKeyValidator = [
  param('pageKey')
    .trim()
    .notEmpty().withMessage('Page key is required')
    .matches(/^[a-z0-9_-]{2,60}$/).withMessage('Invalid page key format (alphanumeric, hyphens and underscores only)'),
];

const configText = ['businessName', 'businessSlogan', 'address', 'city', 'state', 'country', 'postalCode', 'phone', 'whatsapp', 'email', 'latitude', 'longitude', 'gscVerificationCode', 'bingVerificationCode', 'facebookAppId', 'twitterHandle', 'robotsCustomRules'];
const configUrls = ['googleMapsUrl', 'logoUrl', 'faviconUrl', 'defaultOgImage', 'instagramUrl', 'facebookUrl', 'siteUrl'];
const pageText = ['pageTitle', 'metaTitle', 'metaDescription', 'keywords', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription'];
const pageUrls = ['canonicalUrl', 'ogImage', 'twitterImage'];
const configFields = [...configText, ...configUrls, 'businessHours', 'ga4MeasurementId', 'gtmContainerId'];
const pageFields = [...pageText, ...pageUrls, 'robots', 'schemaType', 'customJsonLd', 'isActive'];
const textRules = (fields) => fields.map((key) => body(key).optional().isString().bail().isLength({ max: key === 'robotsCustomRules' ? 2000 : 500 }));
const urlRules = (fields) => fields.map((key) => body(key).optional().isString().bail().isLength({ max: 1000 }).custom(isSafeUrl));
const updateConfigValidators = [
  ...textRules(configText), ...urlRules(configUrls),
  body('email').optional().custom((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
  body('siteUrl').optional().custom((value) => { const url = new URL(value); return url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash; }),
  ...['ga4MeasurementId', 'gtmContainerId'].map((key) => body(key).optional().equals('').withMessage('External analytics scripts are disabled')),
  body('businessHours').optional().isObject({ strict: true }).bail().custom((value) => Object.entries(value).every(([day, hours]) => ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(day) && typeof hours === 'string' && (hours === '' || /^(?:[01][0-9]|2[0-3]):[0-5][0-9]-(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(hours)))),
];
const upsertPageValidators = [
  ...pageKeyValidator, ...textRules(pageText), ...urlRules(pageUrls),
  body('robots').optional().isIn(['index, follow', 'noindex, follow', 'noindex, nofollow']),
  body('schemaType').optional().isIn(['WebPage', 'WebSite', 'CollectionPage', 'Product', 'AboutPage', 'ContactPage']),
  body('isActive').optional().custom((value) => typeof value === 'boolean'),
  body('customJsonLd').optional().isString().bail().isLength({ max: 20000 }).bail().custom((value) => { if (!value) return true; const parsed = JSON.parse(value); return parsed !== null && typeof parsed === 'object'; }),
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
  configFields, pageFields,
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
