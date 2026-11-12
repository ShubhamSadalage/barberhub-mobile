import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/env';
import { tokenStorage } from '@/auth/tokenStorage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Called by AuthContext once, so the client can force a logout when the
// refresh token itself is invalid/expired (e.g. revoked, or reused-token theft detection fired).
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Refresh-on-401 with request queueing -----
// If N requests fail with 401 at the same time, we only want ONE refresh call;
// the rest should wait for it and retry with the new token.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh-endpoint itself, or login/register endpoints.
    if (originalRequest.url?.includes('/api/auth/refresh')) {
      await tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait for the in-flight refresh to finish, then retry this request.
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token stored.');

      const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);

      flushQueue(null, data.accessToken);
      isRefreshing = false;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      isRefreshing = false;
      await tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  }
);
