import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useAuth } from "./AuthContext";

export default function RequireAdmin() {
    const { admin, loading } = useAuth();
    const location = useLocation();

    const [openSnackbar, setOpenSnackbar] = useState(admin && !['ADMIN', 'STAFF'].includes(admin.role));

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!admin) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!['ADMIN', 'STAFF'].includes(admin.role)) {
        return (
            <>
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={4000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity="error" variant="filled">
                        Bạn không có quyền truy cập trang quản trị
                    </Alert>
                </Snackbar>
                <Navigate to="/" replace />
            </>
        );
    }

    return <Outlet />;
}