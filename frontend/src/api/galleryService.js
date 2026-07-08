import api from './axios';
import { emitSiteEvent, SITE_EVENTS } from '../lib/siteEvents';

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
    const response = await api.get('/gallery', { params });
    return response.data;
  },

  async categories() {
    const response = await api.get('/gallery/categories/list');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/gallery/${id}`);
    return response.data;
  },

  async create(product) {
    const response = await api.post('/gallery', toMultipartData(product));
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },

  async update(id, product) {
    const response = await api.put(`/gallery/${id}`, toMultipartData(product));
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/gallery/${id}`);
    emitSiteEvent(SITE_EVENTS.galleryChanged, {});
    return response.data;
  },
};
