import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "../lib/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !String(originalRequest?.url || "").includes("/auth/login") &&
      !String(originalRequest?.url || "").includes("/auth/signup") &&
      !String(originalRequest?.url || "").includes("/auth/admin/login") &&
      !String(originalRequest?.url || "").includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh");
        }

        const { data } = await refreshPromise;
        refreshPromise = null;

        if (data?.token) {
          setAccessToken(data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        clearAccessToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
