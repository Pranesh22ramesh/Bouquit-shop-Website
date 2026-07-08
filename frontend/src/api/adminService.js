import api from "./axios";

export const adminService = {
  async getDashboard() {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },
};
