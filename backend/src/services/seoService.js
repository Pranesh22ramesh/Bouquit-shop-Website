// src/services/seoService.js
const seoRepository = require('../repositories/seoRepository');
const { prisma } = require('../config/prisma');

const getConfig = async () => seoRepository.getOrCreateConfig();

const updateConfig = async (data) => {
  // Sanitize: only allow known fields
  const allowed = [
    'businessName','businessSlogan','address','city','state','country','postalCode',
    'phone','whatsapp','email','latitude','longitude','googleMapsUrl','businessHours',
    'logoUrl','faviconUrl','defaultOgImage','ga4MeasurementId','gtmContainerId',
    'gscVerificationCode','bingVerificationCode','facebookAppId','instagramUrl',
    'facebookUrl','twitterHandle','siteUrl','robotsCustomRules',
  ];
  const sanitized = {};
  for (const key of allowed) {
    if (data[key] !== undefined) sanitized[key] = data[key];
  }
  return seoRepository.updateConfig(sanitized);
};

const getPage = async (pageKey) => {
  const page = await seoRepository.getOrCreatePage(pageKey);
  if (!page) return null;
  return page;
};

const getAllPages = async () => seoRepository.getAllPages();

const upsertPage = async (pageKey, data) => {
  const allowed = [
    'pageTitle','metaTitle','metaDescription','keywords','canonicalUrl','robots',
    'ogTitle','ogDescription','ogImage','twitterTitle','twitterDescription',
    'twitterImage','schemaType','customJsonLd','isActive',
  ];
  const sanitized = {};
  for (const key of allowed) {
    if (data[key] !== undefined) sanitized[key] = data[key];
  }
  return seoRepository.upsertPage(pageKey, sanitized);
};

const generateSitemap = async () => {
  const config = await seoRepository.getOrCreateConfig();
  const siteUrl = (config.siteUrl || 'https://karurflowershop.vercel.app').replace(/\/$/, '');

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/gallery', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/reviews', priority: '0.6', changefreq: 'weekly' },
  ];

  // Get all active products
  const products = await prisma.product.findMany({
    where: { availability: 'AVAILABLE' },
    select: { id: true, updatedAt: true, name: true },
    orderBy: { updatedAt: 'desc' },
  });

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const page of staticPages) {
    xml += `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  for (const product of products) {
    const slug = product.id;
    xml += `  <url>
    <loc>${siteUrl}/product/${slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
};

const generateRobots = async () => {
  const config = await seoRepository.getOrCreateConfig();
  const siteUrl = (config.siteUrl || 'https://karurflowershop.vercel.app').replace(/\/$/, '');

  let robots = `User-agent: *
Allow: /
Allow: /gallery
Allow: /about
Allow: /contact
Allow: /reviews
Allow: /product/

Disallow: /admin
Disallow: /admin/*
Disallow: /checkout
Disallow: /cart
Disallow: /my-orders
Disallow: /api/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password/

`;

  if (config.robotsCustomRules) {
    robots += config.robotsCustomRules + '\n\n';
  }

  robots += `Sitemap: ${siteUrl}/api/seo/sitemap.xml\n`;
  return robots;
};

const getSeoHealthCheck = async () => {
  const pages = await seoRepository.getAllPages();
  const products = await prisma.product.findMany({ select: { id: true, name: true, image: true } });

  const issues = [];
  let score = 100;

  // Check all pages
  const titles = [];
  const descriptions = [];

  for (const page of pages) {
    const titleLen = page.metaTitle.length;
    const descLen = page.metaDescription.length;

    if (titleLen < 30 || titleLen > 65) {
      issues.push({ severity: 'warning', page: page.pageKey, issue: `Meta title is ${titleLen} chars (ideal: 50-60)` });
      score -= 3;
    }
    if (descLen < 120 || descLen > 165) {
      issues.push({ severity: 'warning', page: page.pageKey, issue: `Meta description is ${descLen} chars (ideal: 150-160)` });
      score -= 3;
    }
    if (!page.keywords) {
      issues.push({ severity: 'info', page: page.pageKey, issue: 'Missing keywords' });
      score -= 1;
    }

    titles.push(page.metaTitle);
    descriptions.push(page.metaDescription);
  }

  // Check for duplicate titles
  const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupTitles.length > 0) {
    issues.push({ severity: 'error', page: 'global', issue: `${dupTitles.length} duplicate meta title(s) found` });
    score -= 10;
  }

  // Check products without images
  const productsNoImage = products.filter((p) => !p.image);
  if (productsNoImage.length > 0) {
    issues.push({ severity: 'warning', page: 'products', issue: `${productsNoImage.length} product(s) missing images` });
    score -= productsNoImage.length * 2;
  }

  // Check config
  const config = await seoRepository.getOrCreateConfig();
  if (!config.ga4MeasurementId) {
    issues.push({ severity: 'info', page: 'config', issue: 'Google Analytics 4 ID not configured' });
    score -= 5;
  }
  if (!config.defaultOgImage) {
    issues.push({ severity: 'warning', page: 'config', issue: 'Default Open Graph image not set' });
    score -= 5;
  }
  if (!config.gscVerificationCode) {
    issues.push({ severity: 'info', page: 'config', issue: 'Google Search Console not verified' });
    score -= 3;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    totalPages: pages.length,
    totalProducts: products.length,
    issues,
    productsWithImages: products.filter((p) => p.image).length,
  };
};

module.exports = { getConfig, updateConfig, getPage, getAllPages, upsertPage, generateSitemap, generateRobots, getSeoHealthCheck };
