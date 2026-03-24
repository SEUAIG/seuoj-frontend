import axios from "axios";
import { ENV } from "@/config/env";
//  用于配置axios 实例
export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});
let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};
api.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState();
      const token = state.auth.jwt;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);