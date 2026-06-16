import { createContext, useContext, useEffect, useState } from "react";
import { authStorage } from "./authStorage";
import { authApi } from "@/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // CHECK LOGIN & FETCH ME
    // =========================
    useEffect(() => {
        const initAuth = async () => {
            const token = authStorage.getAccessToken();

            if (token) {
                try {
                    // Gọi API lấy thông tin admin khi F5 trang
                    const userData = await authApi.getMe();
                    setAdmin(userData);
                } catch (error) {
                    // Nếu token hết hạn hoặc lỗi, xóa sạch và yêu cầu đăng nhập lại
                    console.error("Auth check failed:", error);
                    authStorage.clear();
                    setAdmin(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // =========================
    // LOGIN
    // =========================
    const login = ({ accessToken, refreshToken, user }) => {
        authStorage.setTokens({ accessToken, refreshToken });
        setAdmin(user);
    };

    // =========================
    // LOGOUT
    // =========================
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            authStorage.clear();
            setAdmin(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                admin,
                loading,
                login,
                logout,
                isAuthenticated: !!admin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// =========================
// CUSTOM HOOK
// =========================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};