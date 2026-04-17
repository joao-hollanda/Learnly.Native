import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const deploy = "https://learnly-api-yrdu.onrender.com/api/";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const HTTPClient = axios.create({
  baseURL: deploy,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

HTTPClient.interceptors.request.use(async (config) => {
  if (config.headers["Authorization"]) return config;

  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  } catch {
  }
  return config;
});

HTTPClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return HTTPClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) throw new Error("Sem refresh token");

        const response = await axios.post(
          `${deploy}Login/mobile/refresh`,
          { refreshToken },
          { _skipAuthRefresh: true }
        );

        const { accessToken, refreshToken: newRefresh } = response.data;

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, newRefresh);

        HTTPClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return HTTPClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        delete HTTPClient.defaults.headers.common["Authorization"];

        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);