const { Availability, ProductBadge } = require('@prisma/client');
const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/apiError');
const { serializeProduct } = require('../utils/serializers');
const { deleteImage, uploadImage } = require('./storageService');
const { analyzeProducts } = require('./merchandisingAnalyzerService');

const badgeMap = {
  Normal: ProductBadge.NORMAL,
  'New Arrival': ProductBadge.NEW_ARRIVAL,
  New: ProductBadge.NEW_ARRIVAL,
  Offer: ProductBadge.OFFER,
};

const availabilityMap = {
  Available: Availability.AVAILABLE,
  Unavailable: Availability.UNAVAILABLE,
};

const CATEGORY_ORDER = ['bouquets', 'hairstyles', 'bridalflowers'];

const normalizeCategoryName = (category = '') =>
  String(category)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

const getCategoryPriority = (category) => {
  const normalized = normalizeCategoryName(category);
  if (normalized === 'bouquet' || normalized === 'bouquets') return 0;
  if (normalized === 'hairstyle' || normalized === 'hairstyles' || normalized === 'hair') return 1;
  if (normalized === 'bridalflower' || normalized === 'bridalflowers' || normalized === 'bridal') return 2;
  const index = CATEGORY_ORDER.indexOf(normalized);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const getCategoryDisplayLabel = (category) => {
  const normalized = normalizeCategoryName(category);
  if (normalized === 'bouquet' || normalized === 'bouquets') return 'Bouquets';
  if (normalized === 'hairstyle' || normalized === 'hairstyles' || normalized === 'hair') return 'Hairstyles';
  if (normalized === 'bridalflower' || normalized === 'bridalflowers' || normalized === 'bridal') return 'Bridal Flowers';
  return category;
};

const TRANSIENT_DATABASE_ERRORS = new Set(['P1001', 'P1002', 'P2024']);

const runProductQuery = async (operation, maxAttempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!TRANSIENT_DATABASE_ERRORS.has(error?.code) || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }

  throw lastError;
};

const normalizePayload = (payload, hasNewImage = false, isCreate = false) => {
  const name = String(payload.name || '').trim();
  const category = String(payload.category || '').trim();
  const price = Number(payload.price);
  const badge = badgeMap[payload.badge || payload.productStatus];
  const availability = availabilityMap[payload.status || payload.availability];
  const offerPrice = payload.offerPrice === '' || payload.offerPrice == null ? null : Number(payload.offerPrice);

  const errors = {};
  if (!name) errors.name = 'Product name is required';
  if (!category) errors.category = 'Category is required';
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be greater than zero';
  if (!badge) errors.badge = 'Select a valid product status';
  if (!availability) errors.status = 'Select a valid availability';
  if (badge === ProductBadge.OFFER) {
    if (!Number.isFinite(offerPrice) || offerPrice <= 0) errors.offerPrice = 'Offer price is required';
    if (Number.isFinite(offerPrice) && Number.isFinite(price) && offerPrice >= price) {
      errors.offerPrice = 'Offer price must be less than the original price';
    }
  }
  if (isCreate && !hasNewImage) errors.image = 'Product image is required';

  if (Object.keys(errors).length > 0) throw new ApiError(400, 'Validation failed', errors);

  return {
    name,
    category,
    price,
    offerPrice: badge === ProductBadge.OFFER ? offerPrice : null,
    description: String(payload.description || '').trim(),
    badge,
    availability,
    featured: payload.featured === true || payload.featured === 'true',
    customizedAvailable: payload.customizedAvailable !== false && payload.customizedAvailable !== 'false',
  };
};

const listProducts = async (query = {}) => {
  const where = {};

  if (query.keyword || query.search) {
    where.name = {
      contains: String(query.keyword || query.search).trim(),
      mode: 'insensitive',
    };
  }

  if (query.category && query.category !== 'all') {
    where.category = {
      equals: String(query.category).trim(),
      mode: 'insensitive',
    };
  }

  if (query.featured) where.featured = true;
  if (String(query.status || '').toLowerCase() === 'available') {
    where.availability = Availability.AVAILABLE;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 1000, 1), 1000);
  const products = await runProductQuery(() =>
    prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })
  );
  const analysis = await runProductQuery(() => analyzeProducts(products));
  let analyzedProducts = products.map((product) => ({
    ...serializeProduct(product),
    analytics: analysis.get(product.id),
  }));

  const filter = String(query.filter || 'all').toLowerCase();
  if (filter === 'latest') analyzedProducts = analyzedProducts.filter((product) => product.analytics.tags.includes('Latest'));
  if (filter === 'high-selling') analyzedProducts = analyzedProducts.filter((product) => product.analytics.tags.includes('High Selling'));
  if (filter === 'offered') analyzedProducts = analyzedProducts.filter((product) => product.analytics.tags.includes('Offered'));
  if (filter === 'combo') analyzedProducts = analyzedProducts.filter((product) => product.analytics.tags.length >= 2);

  const sort = String(query.sort || 'latest').toLowerCase();
  if (sort === 'oldest') analyzedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === 'price-low') analyzedProducts.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
  else if (sort === 'price-high') analyzedProducts.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
  else if (sort === 'name-asc') analyzedProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'high-selling') analyzedProducts.sort((a, b) => b.analytics.unitsSold - a.analytics.unitsSold);
  else analyzedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return analyzedProducts.slice(0, limit);
};

const listCategories = async () => {
  const categories = await runProductQuery(() =>
    prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })
  );

  return categories
    .map((entry) => entry.category?.trim())
    .filter(Boolean)
    .sort((a, b) => {
      const priorityA = getCategoryPriority(a);
      const priorityB = getCategoryPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.localeCompare(b);
    })
    .map((category) => ({ value: category, label: getCategoryDisplayLabel(category) }));
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found');
  return serializeProduct(product);
};

const createProduct = async (payload, file) => {
  const data = normalizePayload(payload, Boolean(file), true);
  const uploadedImage = file
    ? await uploadImage({
        file,
        folder: 'products',
        filenameBase: payload.name || 'product',
      })
    : null;

  const product = await prisma.product.create({
    data: {
      ...data,
      image: uploadedImage?.url || null,
    },
  });

  return serializeProduct(product);
};

const updateProduct = async (id, payload, file) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Product not found');

  const next = normalizePayload(payload, Boolean(file), false);
  const uploadedImage = file
    ? await uploadImage({
        file,
        folder: 'products',
        filenameBase: payload.name || existing.name || 'product',
      })
    : null;

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...next,
      image: uploadedImage?.url || existing.image,
    },
  });

  if (file && existing.image) await deleteImage(existing.image);

  return serializeProduct(updated);
};

const deleteProduct = async (id) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Product not found');
  await prisma.product.delete({ where: { id } });
  if (existing.image) await deleteImage(existing.image);
};

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  listProducts,
  updateProduct,
};
