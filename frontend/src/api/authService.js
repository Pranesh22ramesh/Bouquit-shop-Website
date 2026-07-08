import api from "./axios";
import { clearAccessToken, setAccessToken } from "../lib/authStorage";

const applySession = (session) => {
  if (session?.token) setAccessToken(session.token);
  return session?.user ?? null;
};

export const authService = {
  async signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    return applySession(data);
  },

  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return applySession(data);
  },

  async adminLogin(payload) {
    const { data } = await api.post("/auth/admin/login", payload);
    return applySession(data);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAccessToken();
    }
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  async refresh() {
    const { data } = await api.post("/auth/refresh");
    return applySession(data);
  },

  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgotpassword", { email });
    return data;
  },

  async resetPassword(token, payload) {
    const { data } = await api.put(`/auth/resetpassword/${token}`, payload);
    return applySession(data);
  },
};
