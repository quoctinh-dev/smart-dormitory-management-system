import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * AuthLayout
 * Bao bọc các trang xác thực hệ thống Quản trị (Login)
 * Sử dụng Container với maxWidth="xs" để giới hạn chiều rộng, form không bị vỡ trên màn hình UltraWide.
 */
export default function AuthLayout() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Container maxWidth="xs">
                <Outlet />
            </Container>
        </Box>
    );
}