// src/repositories/seoRepository.js
const { prisma } = require('../config/prisma');

const DEFAULT_PAGES = [
  {
    pageKey: 'home',
    pageTitle: 'Home',
    metaTitle: 'Flower Shop in Karur - MIDHUNYAS Petals | Fresh Bouquets & Bridal Flowers',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'flower shop in karur, karur flower shop, bouquet shop karur, fresh flowers karur, MIDHUNYAS petals, bridal flowers karur, wedding flowers karur',
    robots: 'index, follow',
    schemaType: 'WebSite',
  },
  {
    pageKey: 'gallery',
    pageTitle: 'Gallery',
    metaTitle: 'Bouquets & Flowers Gallery - Karur | MIDHUNYAS Petals',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'flower gallery karur, bouquet photos, bridal flowers karur, birthday bouquet karur, customized bouquets karur',
    robots: 'index, follow',
    schemaType: 'CollectionPage',
  },
  {
    pageKey: 'about',
    pageTitle: 'About Us',
    metaTitle: 'About MIDHUNYAS Petals - Flower Shop in Karur',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'about midhunyas petals, karur flower shop, flower shop history karur',
    robots: 'index, follow',
    schemaType: 'AboutPage',
  },
  {
    pageKey: 'contact',
    pageTitle: 'Contact',
    metaTitle: 'Contact Flower Shop Karur - MIDHUNYAS Petals | +91 9942071721',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'contact flower shop karur, flower delivery karur, whatsapp flower order karur',
    robots: 'index, follow',
    schemaType: 'ContactPage',
  },
  {
    pageKey: 'reviews',
    pageTitle: 'Reviews',
    metaTitle: 'Customer Reviews - MIDHUNYAS Petals Karur Flower Shop',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'midhunyas petals reviews, karur flower shop reviews, customer feedback',
    robots: 'index, follow',
    schemaType: 'WebPage',
  },
];

const DEFAULT_CONFIG = {
  businessName: 'MIDHUNYAS Petals',
  businessSlogan: "Bouquets and bridal flowers in Karur",
  address: 'Karur, Tamil Nadu, India',
  city: 'Karur',
  state: 'Tamil Nadu',
  country: 'India',
  postalCode: '639001',
  phone: '+91 9942071721',
  whatsapp: '+91 9942071721',
  email: '',
  latitude: '10.9601',
  longitude: '78.0766',
  googleMapsUrl: 'https://maps.google.com/?q=Karur,Tamil+Nadu',
  businessHours: {},
  logoUrl: '',
  faviconUrl: '',
  defaultOgImage: '',
  ga4MeasurementId: '',
  gtmContainerId: '',
  gscVerificationCode: '',
  bingVerificationCode: '',
  facebookAppId: '',
  instagramUrl: '',
  facebookUrl: '',
  twitterHandle: '',
  siteUrl: 'https://karurflowershop.vercel.app',
  robotsCustomRules: '',
};

const getOrCreateConfig = async () => {
  let config = await prisma.seoConfig.findFirst();
  if (!config) {
    config = DEFAULT_CONFIG;
  }
  return config;
};

const updateConfig = async (data) => {
  let config = await prisma.seoConfig.findFirst();
  if (!config) {
    return prisma.seoConfig.create({ data: { ...DEFAULT_CONFIG, ...data } });
  }
  return prisma.seoConfig.update({ where: { id: config.id }, data });
};

const getOrCreatePage = async (pageKey) => {
  let page = await prisma.seoPage.findUnique({ where: { pageKey } });
  if (!page) {
    const defaults = DEFAULT_PAGES.find((p) => p.pageKey === pageKey);
    if (defaults) {
      page = defaults;
    }
  }
  return page;
};

const getAllPages = async () => {
  const existing = await prisma.seoPage.findMany({ orderBy: { pageKey: 'asc' } });
  const existingKeys = existing.map((p) => p.pageKey);
  const missing = DEFAULT_PAGES.filter((p) => !existingKeys.includes(p.pageKey));
  if (missing.length > 0) {
    return [...existing, ...missing];
  }
  return existing;
};

const upsertPage = async (pageKey, data) => {
  return prisma.seoPage.upsert({
    where: { pageKey },
    update: data,
    create: {
      pageKey,
      pageTitle: data.pageTitle || pageKey,
      metaTitle: data.metaTitle || '',
      metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
      ...data,
    },
  });
};

module.exports = { getOrCreateConfig, updateConfig, getOrCreatePage, getAllPages, upsertPage, DEFAULT_PAGES };
