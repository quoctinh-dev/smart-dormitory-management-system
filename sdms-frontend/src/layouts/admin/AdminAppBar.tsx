import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Toolbar, Box, Button, IconButton } from '@mui/material';

import NotificationBell from '@/components/common/NotificationBell';
import { useAuth } from '@/providers/AuthProvider';

interface AdminAppBarProps {
    onMobileNavOpen: () => void;
    collapsed?: boolean;
}

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

export default function AdminAppBar({ onMobileNavOpen, collapsed = false }: AdminAppBarProps) {
    const { logout } = useAuth();

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)', // Vẫn giữ bóng mờ nhưng thêm viền để nối liền với Sidebar
                width: {
                    xs: '100%',
                    md: `calc(100% - ${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`
                },
                ml: {
                    md: `${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px`
                },
                transition: 'width 0.25s ease, margin 0.25s ease',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', height: 72, px: { xs: 2, sm: 3.5 } }}>
                {/* Phía bên trái: Chỉ giữ nút Menu cho mobile, loại bỏ hoàn toàn chữ trùng lặp để giao diện thoáng */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMobileNavOpen}
                        sx={{ display: { md: 'none' }, borderRadius: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>

                {/* Phía bên phải: Chuông thông báo & Đăng xuất */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, ml: 'auto' }}>
                    <NotificationBell />
                    <Button
                        color="error"
                        variant="text"
                        disableElevation
                        startIcon={<LogoutIcon />}
                        onClick={logout}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 2,
                            py: 0.8,
                            '&:hover': {
                                bgcolor: (theme) => theme.palette.error.lighter || 'rgba(211, 47, 47, 0.08)',
                            }
                        }}
                    >
                        Đăng xuất
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}