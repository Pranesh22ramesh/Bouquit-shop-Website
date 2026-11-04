import api from './axios';
import { emitSiteEvent, SITE_EVENTS } from '../lib/siteEvents';

const clientCache = new Map();
const CACHE_TTL = 45 * 1000; // 45 seconds client memory cache

export const clearGalleryCache = () => {
  clientCache.clear();
};

const toMultipartData = (product) => {
  const data = new FormData();
  const fields = [
    'name', 'category', 'price', 'offerPrice', 'description',
    'badge', 'status', 'customizedAvailable', 'featured',
  ];

  fields.forEach((field) => {
    if (product[field] !== undefined && product[field] !== null) {
      data.append(field, product[field]);
    }
  });
  if (product.image instanceof File) data.append('image', product.image);
  return data;
};

export const galleryService = {
  async list(params = {}) {
    const cacheKey = `list_${JSON.stringify(params)}`;
    const cached = clientCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.time < CACHE_TTL) {
      return cached.data;
    }

    const response = await api.get('/gallery', { params });
    clientCache.set(cacheKey, { time: now, data: response.data });
    return response.data;
  },

  async categories() {
    const cached = clientCache.get('categories_list');
    const now = Date.now();
    if (cached && now - cached.time < 60 * 1000) {
      return cached.data;
    }

    const response = await api.get('/gallery/categories/list');
    clientCache.set('categories_list', { time: now, data: response.data });
    return response.data;
  },

  async getById(id) {
    const cacheKey = `product_${id}`;
    const cached = clientCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.time < CACHE_TTL) {
      return cached.data;
    }

    const response = await api.get(`/gallery/${id}`);
    clientCache.set(cacheKey, { time: now, data: response.data });
    return response.data;
  },

  async create(product) {
    const response = await api.post('/gallery', toMultipartData(product));
    clearGalleryCache();
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },

  async update(id, product) {
    const response = await api.put(`/gallery/${id}`, toMultipartData(product));
    clearGalleryCache();
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/gallery/${id}`);
    clearGalleryCache();
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },

  clearCache: clearGalleryCache,
};
