import { Box, CssBaseline, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminAppBar from './admin/AdminAppBar';
import AdminSidebar from './admin/AdminSidebar';

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <CssBaseline />

            {/* Thanh tiêu đề phía trên */}
            <AdminAppBar onMobileNavOpen={handleDrawerToggle} collapsed={collapsed} />

            {/* Thanh điều hướng bên (Sidebar hỗ trợ thu gọn/mở rộng) */}
            <AdminSidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
            />

            {/* Vung hiển thị nội dung chính, tự động co giãn theo Sidebar */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}
            >
                <Toolbar sx={{ height: 72 }} />
                <Outlet />
            </Box>
        </Box>
    );
}