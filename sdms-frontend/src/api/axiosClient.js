import axios from "axios";
import { authStorage } from "@/auth";

// =========================
// REFRESH VARIABLES
// =========================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) promise.reject(error);
        else promise.resolve(token);
    });
    failedQueue = [];
};

// =========================
// AXIOS INSTANCE
// =========================
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 15000, // Tăng nhẹ timeout cho các request phức tạp
});

// =========================
// REQUEST INTERCEPTOR
// =========================
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

// =========================
// RESPONSE INTERCEPTOR
// =========================
axiosClient.interceptors.response.use(
    (response) => response.data?.success !== undefined ? response.data.data : response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Xử lý logic 401 Unauthorized
        if (status === 401 && !originalRequest._retry) {
            const refreshToken = authStorage.getRefreshToken();

            if (!refreshToken) {
                authStorage.clear();
                window.location.href = "/admin/login";
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Sử dụng axios trực tiếp để tránh vòng lặp interceptor của axiosClient
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, { 
                    refreshToken 
                });

                const { accessToken, refreshToken: newRefreshToken } = data.data;
                authStorage.setTokens({ accessToken, refreshToken: newRefreshToken });

                processQueue(null, accessToken);
                
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                authStorage.clear();
                window.location.href = "/admin/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Trả về lỗi đã chuẩn hóa
        return Promise.reject({
            status,
            message: error.response?.data?.message || "Đã có lỗi xảy ra",
            data: error.response?.data
        });
    }
);

export default axiosClient;