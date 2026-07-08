import api from "./axios";

export const userService = {
  async updateProfile(payload) {
    const { data } = await api.put("/users/profile", payload);
    return data;
  },

  async getActivities() {
    const { data } = await api.get("/users/activities");
    return data;
  },

  async getCart() {
    const { data } = await api.get("/users/cart");
    return data;
  },

  async addToCart(payload) {
    const { data } = await api.post("/users/cart", payload);
    return data;
  },

  async updateCart(payload) {
    const { data } = await api.put("/users/cart", payload);
    return data;
  },

  async removeCartItem(id) {
    const { data } = await api.delete(`/users/cart/${id}`);
    return data;
  },

  async toggleLike(productId) {
    const { data } = await api.post(`/users/likes/${productId}`);
    return data;
  },

  async getWishlist() {
    const { data } = await api.get("/users/wishlist");
    return data;
  },

  async toggleWishlist(productId) {
    const { data } = await api.post(`/users/wishlist/${productId}`);
    return data;
  },

  async listUsers(params = {}) {
    const { data } = await api.get("/users", { params });
    return data;
  },

  async getUserById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async getUserActivities(id) {
    const { data } = await api.get(`/users/${id}/activities`);
    return data;
  },

  async updateUserStatus(id, isActive) {
    const { data } = await api.patch(`/users/${id}/status`, { isActive });
    return data;
  },

  async updateUserPassword(id, password) {
    const { data } = await api.put(`/users/${id}/password`, { password });
    return data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
