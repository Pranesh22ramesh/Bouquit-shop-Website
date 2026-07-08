const { prisma } = require('../config/prisma');
const { deleteImage, uploadImage } = require('./storageService');

const defaultContent = {
  'home-highlight': {
    heroText: 'Crafting Eternal Wedding Memories',
    heroDescription: 'Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration.',
    badgeText: 'Handcrafted daily',
    primaryButtonLabel: 'Explore Gallery',
    primaryButtonLink: '/gallery',
    secondaryButtonLabel: 'Customer Stories',
    secondaryButtonLink: '/reviews',
    banners: [],
    featuredProductIds: [],
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

const getContent = async (key) => {
  const existing = await prisma.contentSection.findUnique({ where: { key } });
  if (existing) return existing.data;

  const seeded = await prisma.contentSection.create({
    data: {
      key,
      data: defaultContent[key] || {},
    },
  });
  return seeded.data;
};

const deleteRemovedUrls = async (before = [], after = []) => {
  const removed = before.filter((url) => url && !after.includes(url));
  await Promise.all(removed.map((url) => deleteImage(url)));
};

const updateContent = async (key, data, files = []) => {
  const current = await getContent(key);
  const next = { ...current, ...data };

  if (key === 'home-highlight') {
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

    await deleteRemovedUrls(normalizeArray(current.banners), next.banners);
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
