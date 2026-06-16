// src/auth/RequireAdmin.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom"; // Thêm useLocation
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./AuthContext";

export default function RequireAdmin() {
    const { admin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!admin) {
        // Lưu lại đường dẫn user đang cố truy cập (ví dụ /admin/dashboard)
        // để sau khi đăng nhập thành công, ta redirect họ quay lại đó
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Optional: Kiểm tra role nếu cần
    // if (admin.role !== 'ADMIN') return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}