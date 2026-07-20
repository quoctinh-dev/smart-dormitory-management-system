import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { authStorage } from '@/helpers/auth-storage';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error | unknown) => void;
}> = [];

const processQueue = (error: Error | unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token as string);
  });
  failedQueue = [];
};

const API_URL = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error: AxiosError<{ message?: string; errorCode?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        return Promise.reject(error.response?.data || error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi axios thông thường để tránh vòng lặp interceptor
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
          refreshToken,
        });

        const data = response.data?.data ?? response.data;
        const accessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        authStorage.setTokens({ accessToken, refreshToken: newRefreshToken });

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        authStorage.clear();

        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
