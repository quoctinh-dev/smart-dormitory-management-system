import axios from "axios";
import { authStorage } from "@/auth";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) promise.reject(error);
        else promise.resolve(token);
    });
    failedQueue = [];
};

const API_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000,
});

axiosClient.interceptors.request.use(
    (config) => {
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
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error.response?.data || error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
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
                const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {
                    refreshToken
                });

                // Lưu ý rà soát cấu trúc JSON đầu ra của API để đảm bảo trích xuất đúng object chứa token
                const { accessToken, refreshToken: newRefreshToken } = data.data ?? data;
                authStorage.setTokens({ accessToken, refreshToken: newRefreshToken });

                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                authStorage.clear();
                
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = "/admin/login";
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