// src/repositories/seoRepository.js
const { prisma } = require('../config/prisma');

const DEFAULT_PAGES = [
  {
    pageKey: 'home',
    pageTitle: 'Home',
    metaTitle: 'Flower Shop in Karur - MIDHUNYAS Petals | Fresh Bouquets & Bridal Flowers',
    metaDescription: "MIDHUNYAS Petals — Karur's premier flower shop. Shop handcrafted bouquets, bridal flowers, wedding garlands, anniversary arrangements & custom floral gifts. Order online with WhatsApp delivery.",
    keywords: 'flower shop in karur, karur flower shop, bouquet shop karur, fresh flowers karur, MIDHUNYAS petals, bridal flowers karur, wedding flowers karur',
    robots: 'index, follow',
    schemaType: 'WebSite',
  },
  {
    pageKey: 'gallery',
    pageTitle: 'Gallery',
    metaTitle: 'Bouquets & Flowers Gallery - Karur | MIDHUNYAS Petals',
    metaDescription: "Browse our beautiful gallery of fresh bouquets, bridal flowers, anniversary arrangements, birthday bouquets and customized floral collections from Karur's best flower shop.",
    keywords: 'flower gallery karur, bouquet photos, bridal flowers karur, birthday bouquet karur, customized bouquets karur',
    robots: 'index, follow',
    schemaType: 'CollectionPage',
  },
  {
    pageKey: 'about',
    pageTitle: 'About Us',
    metaTitle: 'About MIDHUNYAS Petals - Karur Flower Shop Since 2012',
    metaDescription: "Learn about MIDHUNYAS Petals, Karur's trusted flower shop. We create handcrafted bouquets, bridal flowers, and customized floral arrangements with love and expertise.",
    keywords: 'about midhunyas petals, karur flower shop, flower shop history karur',
    robots: 'index, follow',
    schemaType: 'AboutPage',
  },
  {
    pageKey: 'contact',
    pageTitle: 'Contact',
    metaTitle: 'Contact Flower Shop Karur - MIDHUNYAS Petals | +91 9942071721',
    metaDescription: 'Contact MIDHUNYAS Petals for flower orders, custom bouquets, bridal flowers and wedding arrangements in Karur, Tamil Nadu. Call or WhatsApp +91 9942071721.',
    keywords: 'contact flower shop karur, flower delivery karur, whatsapp flower order karur',
    robots: 'index, follow',
    schemaType: 'ContactPage',
  },
  {
    pageKey: 'reviews',
    pageTitle: 'Reviews',
    metaTitle: 'Customer Reviews - MIDHUNYAS Petals Karur Flower Shop',
    metaDescription: "Read genuine customer reviews for MIDHUNYAS Petals, Karur's best flower shop. See what our happy customers say about our bouquets, bridal flowers and delivery.",
    keywords: 'midhunyas petals reviews, karur flower shop reviews, customer feedback',
    robots: 'index, follow',
    schemaType: 'WebPage',
  },
];

const DEFAULT_CONFIG = {
  businessName: 'MIDHUNYAS Petals',
  businessSlogan: "Karur's Finest Flower Shop",
  address: 'Karur, Tamil Nadu, India',
  city: 'Karur',
  state: 'Tamil Nadu',
  country: 'India',
  postalCode: '639001',
  phone: '+91 9942071721',
  whatsapp: '+91 9942071721',
  email: 'miudhunyas2012karur@gmail.com',
  latitude: '10.9601',
  longitude: '78.0766',
  googleMapsUrl: 'https://maps.google.com/?q=Karur,Tamil+Nadu',
  businessHours: {
    monday: '09:00-20:00',
    tuesday: '09:00-20:00',
    wednesday: '09:00-20:00',
    thursday: '09:00-20:00',
    friday: '09:00-20:00',
    saturday: '09:00-20:00',
    sunday: '10:00-18:00',
  },
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
    config = await prisma.seoConfig.create({ data: DEFAULT_CONFIG });
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
      page = await prisma.seoPage.create({ data: defaults });
    }
  }
  return page;
};

const getAllPages = async () => {
  const existing = await prisma.seoPage.findMany({ orderBy: { pageKey: 'asc' } });
  const existingKeys = existing.map((p) => p.pageKey);
  const missing = DEFAULT_PAGES.filter((p) => !existingKeys.includes(p.pageKey));
  if (missing.length > 0) {
    await prisma.seoPage.createMany({ data: missing });
    return prisma.seoPage.findMany({ orderBy: { pageKey: 'asc' } });
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
      metaDescription: data.metaDescription || '',
      ...data,
    },
  });
};

module.exports = { getOrCreateConfig, updateConfig, getOrCreatePage, getAllPages, upsertPage, DEFAULT_PAGES };
