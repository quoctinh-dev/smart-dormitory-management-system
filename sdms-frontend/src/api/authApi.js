import axiosClient from "./axiosClient";

// =========================
// ENDPOINT CONSTANTS
// =========================
const AUTH_URL = "/v1/auth";
const USER_URL = "/v1/users";

/**
 * Auth API Service
 * Xử lý các logic liên quan đến xác thực và thông tin người dùng
 */
const authApi = {
    // --- AUTH API ---
    
    /** @param {{usernameOrEmail: string, password: string}} data */
    login(data) {
        return axiosClient.post(`${AUTH_URL}/login`, data);
    },

    /** @param {string} refreshToken */
    refreshToken(refreshToken) {
        // Gửi refreshToken theo đúng cấu trúc body mà backend mong đợi
        return axiosClient.post(`${AUTH_URL}/refresh-token`, { refreshToken });
    },

    logout() {
        return axiosClient.post(`${AUTH_URL}/logout`);
    },

    /** @param {{currentPassword: string, newPassword: string}} data */
    changePassword(data) {
        return axiosClient.post(`${AUTH_URL}/change-password`, data);
    },

    forgotPassword(data) {
        return axiosClient.post(`${AUTH_URL}/forgot-password`, data);
    },

    resetPassword(data) {
        return axiosClient.post(`${AUTH_URL}/reset-password`, data);
    },

    // --- USER API ---

    /**
     * Lấy thông tin user hiện tại (thường dùng sau khi login để set AuthContext)
     */
    getMe() {
        return axiosClient.get(`${USER_URL}/me`);
    }
};

export default authApi;