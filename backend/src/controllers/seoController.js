// src/controllers/seoController.js
const asyncHandler = require('../utils/asyncHandler');
const seoService = require('../services/seoService');

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

module.exports = { getConfig, updateConfig, getAllPages, getPage, upsertPage, getSitemap, getRobots, getHealthCheck };
