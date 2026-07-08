import api from "./axios";
import { emitSiteEvent, SITE_EVENTS } from "../lib/siteEvents";

const appendStructuredField = (formData, key, value) => {
  if (value === undefined) return;
  formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
};

export const contentService = {
  async get(key) {
    const { data } = await api.get(`/content/${key}`);
    return data;
  },

  async update(key, payload, files = {}) {
    const formData = new FormData();
    appendStructuredField(formData, "data", payload);

    Object.entries(files).forEach(([field, value]) => {
      if (!value) return;
      if (Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) formData.append(field, file);
        });
      } else if (value instanceof File) {
        formData.append(field, value);
      }
    });

    const { data } = await api.put(`/content/${key}`, formData);
    emitSiteEvent(SITE_EVENTS.contentChanged, { key });
    return data;
  },
};
