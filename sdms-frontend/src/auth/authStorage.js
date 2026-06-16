// Hằng số định danh để tránh magic strings
const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

/**
 * authStorage
 * Quản lý việc lưu trữ và truy xuất token từ LocalStorage
 */
export const authStorage = {
    
    /** Lấy access token */
    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN);
    },

    /** Lấy refresh token */
    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN);
    },

    /** * Lưu cặp tokens
     * @param {{accessToken: string, refreshToken: string}} tokens 
     */
    setTokens({ accessToken, refreshToken }) {
        if (accessToken) localStorage.setItem(ACCESS_TOKEN, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN, refreshToken);
    },

    /** Xóa sạch thông tin xác thực */
    clear() {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    },

    /** Kiểm tra xem user có token hay không */
    hasToken() {
        return !!localStorage.getItem(ACCESS_TOKEN);
    }
};