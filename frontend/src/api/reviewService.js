import api from "./axios";
import { emitSiteEvent, SITE_EVENTS } from "../lib/siteEvents";

export const reviewService = {
  async list(params = {}) {
    const { data } = await api.get("/reviews", { params });
    return data;
  },

  async create(payload) {
    const formData = new FormData();
    formData.append("rating", payload.rating);
    formData.append("comment", payload.comment);
    formData.append("author", payload.author);
    if (payload.productId) formData.append("productId", payload.productId);
    if (payload.imageFile instanceof File) formData.append("image", payload.imageFile);

    const { data } = await api.post("/reviews", formData);
    emitSiteEvent(SITE_EVENTS.reviewsChanged, {});
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/reviews/${id}`, payload);
    emitSiteEvent(SITE_EVENTS.reviewsChanged, {});
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/reviews/${id}`);
    emitSiteEvent(SITE_EVENTS.reviewsChanged, {});
    return data;
  },
};
