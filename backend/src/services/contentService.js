const { prisma } = require('../config/prisma');
const { deleteImage, extractStoragePath, uploadImage } = require('./storageService');

const defaultHomeCategoryTiles = [
  { id: 'bouquets', name: 'Bouquets', note: 'For every little love story', image: '/gallery/bouquet/bouquet12.jpg' },
  { id: 'hairstyles', name: 'Hairstyles', note: 'Floral accents for graceful styling', image: '/gallery/hairstyle/hairstyle_1.jpg' },
  { id: 'bridal-flowers', name: 'Bridal Flowers', note: 'Made for your moment', image: '/gallery/bridal/flower11.jpg' },
  { id: 'gift-arrangements', name: 'Gift Arrangements', note: 'A joy to give', image: '/gallery/bouquet/bouquet13.jpg' },
];

const defaultHomeInspirationTiles = [
  { id: 'rose-stories', src: '/gallery/bouquet/bouquet1.jpg', label: 'Rose stories', className: 'sm:row-span-2' },
  { id: 'bridal-details', src: '/gallery/bridal/flower12.jpg', label: 'Bridal details', className: '' },
  { id: 'floral-traditions', src: '/gallery/bouquet/bouquet4.jpg', label: 'Floral traditions', className: '' },
  { id: 'gifts-with-heart', src: '/gallery/bouquet/bouquet10.jpg', label: 'Gifts with heart', className: 'sm:col-span-2' },
];

const defaultHomeFallbackProductImages = [
  '/gallery/bouquet/bouquet1.jpg',
  '/gallery/bouquet/bouquet4.jpg',
  '/gallery/bouquet/bouquet13.jpg',
  '/gallery/bouquet/bouquet7.jpg',
];

const defaultContent = {
  'home-highlight': {
    heroText: 'Crafting Your Eternal Memories',
    heroDescription: 'Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration. and We can deliver allover Tamilnadu',
    badgeText: 'Handcrafted daily',
    primaryButtonLabel: 'Explore Gallery',
    primaryButtonLink: '/gallery',
    secondaryButtonLabel: 'Customer Stories',
    secondaryButtonLink: '/reviews',
    homeImagesEditableVersion: 1,
    banners: ['/gallery/bouquet/bouquet13.jpg'],
    featuredProductIds: [],
    categoryTiles: defaultHomeCategoryTiles,
    eventImage: '/gallery/bouquet/bouquet6.jpg',
    inspirationTiles: defaultHomeInspirationTiles,
    fallbackProductImages: defaultHomeFallbackProductImages,
    promotionalSections: [
      {
        id: 'promo-1',
        title: 'Bridal Bouquets',
        description: 'Fresh, styled, and color-matched for your ceremony.',
      },
      {
        id: 'promo-2',
        title: 'Wedding Garlands',
        description: 'Traditional designs with premium flowers and clean finishing.',
      },
    ],
  },
  about: {
    title: 'About Our Studio',
    description: 'We create wedding florals with a focus on freshness, color harmony, and personal detail.',
    mission: 'Design floral work that feels deeply personal to every celebration.',
    vision: 'Become the most trusted wedding floral studio in our region.',
    companyStory:
      'Our team works closely with couples and families to create garlands, bouquets, and decor that feel special from the first sketch to the final delivery.',
    heroImage: '',
    galleryImages: [],
    team: [
      {
        id: 'team-1',
        name: 'Lead Floral Designer',
        role: 'Creative Director',
        bio: 'Leads bouquet and decor styling.',
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    description: 'Reach out for custom floral orders, wedding packages, and event support.',
    shopName: 'Midhunya Wedding Flowers',
    workingHours: '9:00 AM - 8:00 PM',
    phonePrimary: '+91 9942071721',
    phoneSecondary: '',
    whatsapp: '+91 9942071721',
    email: 'hello@midhunyaflowers.com',
    instaUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    address: 'Karur, Tamil Nadu, India',
    googleMapUrl: 'https://www.google.com/maps?q=10.9601,78.0766&z=16&output=embed',
  },
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);
const safeDeleteImage = async (url) => {
  if (url && extractStoragePath(url)) await deleteImage(url);
};

const normalizeCategoryTiles = (value) =>
  normalizeArray(value).map((item, index) => ({
    id: String(item?.id || `category-${index + 1}`),
    name: String(item?.name || ''),
    note: String(item?.note || ''),
    image: String(item?.image || ''),
  }));

const normalizeInspirationTiles = (value) =>
  normalizeArray(value).map((item, index) => ({
    id: String(item?.id || `inspiration-${index + 1}`),
    src: String(item?.src || ''),
    label: String(item?.label || ''),
    className: String(item?.className || ''),
  }));

const normalizeStringArray = (value) => normalizeArray(value).map((item) => String(item || ''));

const hydrateContent = (key, data = {}) => {
  const defaults = defaultContent[key] || {};
  const merged = { ...defaults, ...(data || {}) };

  if (key === 'home-highlight' && !data?.homeImagesEditableVersion) {
    if (!Array.isArray(data?.banners) || data.banners.length === 0) merged.banners = defaults.banners;
    if (!Array.isArray(data?.categoryTiles) || data.categoryTiles.length === 0) merged.categoryTiles = defaults.categoryTiles;
    if (!data?.eventImage) merged.eventImage = defaults.eventImage;
    if (!Array.isArray(data?.inspirationTiles) || data.inspirationTiles.length === 0) merged.inspirationTiles = defaults.inspirationTiles;
    if (!Array.isArray(data?.fallbackProductImages) || data.fallbackProductImages.length === 0) {
      merged.fallbackProductImages = defaults.fallbackProductImages;
    }
  }

  return merged;
};

const uploadHomeIndexedImages = async ({ files, pattern, items, imageKey, folder, filenamePrefix, previousItems = [] }) => {
  for (const file of files) {
    const match = file.fieldname.match(pattern);
    if (!match) continue;

    const index = Number(match[1]);
    if (!Number.isInteger(index) || index < 0 || !items[index]) continue;

    const uploaded = await uploadImage({
      file,
      folder,
      filenameBase: `${filenamePrefix}-${index + 1}`,
    });

    const previousImage = previousItems[index]?.[imageKey];
    if (previousImage && previousImage !== uploaded.url) await safeDeleteImage(previousImage);
    items[index][imageKey] = uploaded.url;
  }

  return items;
};

const getContent = async (key) => {
  const existing = await prisma.contentSection.findUnique({ where: { key } });
  if (existing) return hydrateContent(key, existing.data);

  const seeded = await prisma.contentSection.create({
    data: {
      key,
      data: defaultContent[key] || {},
    },
  });
  return hydrateContent(key, seeded.data);
};

const deleteRemovedUrls = async (before = [], after = []) => {
  const removed = before.filter((url) => url && !after.includes(url));
  await Promise.all(removed.map((url) => safeDeleteImage(url)));
};

const updateContent = async (key, data, files = []) => {
  const current = await getContent(key);
  const next = { ...current, ...data };

  if (key === 'home-highlight') {
    next.homeImagesEditableVersion = 1;
    const existingBanners = normalizeArray(data.banners || current.banners || []);
    const uploadedBanners = [];

    for (const file of files.filter((entry) => entry.fieldname === 'bannerFiles')) {
      const uploaded = await uploadImage({
        file,
        folder: 'content/home',
        filenameBase: file.originalname || 'home-banner',
      });
      uploadedBanners.push(uploaded.url);
    }

    next.banners = [...existingBanners, ...uploadedBanners];
    next.featuredProductIds = normalizeArray(data.featuredProductIds || current.featuredProductIds || []);
    next.promotionalSections = normalizeArray(data.promotionalSections || current.promotionalSections || []);
    next.categoryTiles = normalizeCategoryTiles(data.categoryTiles || current.categoryTiles || defaultHomeCategoryTiles);
    next.eventImage = data.eventImage !== undefined ? String(data.eventImage || '') : String(current.eventImage || '/gallery/bouquet/bouquet6.jpg');
    next.inspirationTiles = normalizeInspirationTiles(data.inspirationTiles || current.inspirationTiles || defaultHomeInspirationTiles);

    const previousFallbackImages = normalizeStringArray(current.fallbackProductImages || defaultHomeFallbackProductImages);
    const fallbackImageItems = normalizeStringArray(data.fallbackProductImages || current.fallbackProductImages || defaultHomeFallbackProductImages).map((image) => ({ image }));

    const eventImageFile = files.find((entry) => entry.fieldname === 'homeEventImageFile');
    if (eventImageFile) {
      const uploaded = await uploadImage({
        file: eventImageFile,
        folder: 'content/home',
        filenameBase: 'home-event',
      });
      next.eventImage = uploaded.url;
    }

    await uploadHomeIndexedImages({
      files,
      pattern: /^homeCategoryImage_(\d+)$/,
      items: next.categoryTiles,
      imageKey: 'image',
      folder: 'content/home/categories',
      filenamePrefix: 'category-card',
      previousItems: normalizeCategoryTiles(current.categoryTiles || defaultHomeCategoryTiles),
    });

    await uploadHomeIndexedImages({
      files,
      pattern: /^homeInspirationImage_(\d+)$/,
      items: next.inspirationTiles,
      imageKey: 'src',
      folder: 'content/home/inspiration',
      filenamePrefix: 'inspiration',
      previousItems: normalizeInspirationTiles(current.inspirationTiles || defaultHomeInspirationTiles),
    });

    await uploadHomeIndexedImages({
      files,
      pattern: /^homeFallbackProductImage_(\d+)$/,
      items: fallbackImageItems,
      imageKey: 'image',
      folder: 'content/home/fallback-products',
      filenamePrefix: 'fallback-product',
      previousItems: previousFallbackImages.map((image) => ({ image })),
    });
    next.fallbackProductImages = fallbackImageItems.map((item) => item.image);

    await deleteRemovedUrls(normalizeArray(current.banners), next.banners);
    await deleteRemovedUrls(
      normalizeCategoryTiles(current.categoryTiles || defaultHomeCategoryTiles).map((item) => item.image),
      next.categoryTiles.map((item) => item.image)
    );
    await deleteRemovedUrls([current.eventImage], [next.eventImage]);
    await deleteRemovedUrls(
      normalizeInspirationTiles(current.inspirationTiles || defaultHomeInspirationTiles).map((item) => item.src),
      next.inspirationTiles.map((item) => item.src)
    );
    await deleteRemovedUrls(previousFallbackImages, next.fallbackProductImages);
  }

  if (key === 'about') {
    const heroImageFile = files.find((entry) => entry.fieldname === 'heroImageFile');
    if (heroImageFile) {
      const uploaded = await uploadImage({
        file: heroImageFile,
        folder: 'content/about',
        filenameBase: 'about-hero',
      });
      if (current.heroImage && current.heroImage !== uploaded.url) await deleteImage(current.heroImage);
      next.heroImage = uploaded.url;
    }

    const existingGalleryImages = normalizeArray(data.galleryImages || current.galleryImages || []);
    const uploadedGalleryImages = [];
    for (const file of files.filter((entry) => entry.fieldname === 'galleryFiles')) {
      const uploaded = await uploadImage({
        file,
        folder: 'content/about',
        filenameBase: file.originalname || 'about-gallery',
      });
      uploadedGalleryImages.push(uploaded.url);
    }

    next.galleryImages = [...existingGalleryImages, ...uploadedGalleryImages];
    next.team = normalizeArray(data.team || current.team || []);

    await deleteRemovedUrls(normalizeArray(current.galleryImages), next.galleryImages);
  }

  const updated = await prisma.contentSection.upsert({
    where: { key },
    update: { data: next },
    create: { key, data: next },
  });

  return updated.data;
};

module.exports = { getContent, updateContent };
