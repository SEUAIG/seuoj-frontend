import axios from "axios";
import { ENV } from "@/config/env";
import { getAuthToken, handleUnauthorizedByStatus, injectAuthStore } from "./authGuard";
//  用于配置axios 实例
export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});
export const injectStore = (_store: any, _purge?: () => Promise<void>) => {
  injectAuthStore(_store, _purge);
};
api.interceptors.request.use(
  (config) => {
    const token = config.headers.Authorization;
    if (!token) {
      const jwt = getAuthToken();
      if (jwt) {
        config.headers.Authorization = `Bearer ${jwt}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleUnauthorizedByStatus(error.response?.status);
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);
