import { 
    AppBar, Toolbar, Typography, Box, Drawer, List, 
    ListItemButton, ListItemText, Button, CssBaseline 
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth";

// Định nghĩa hằng số logic
const DRAWER_WIDTH = 260; // Bạn có thể move vào theme.spacing nếu muốn đồng bộ sâu hơn

const menuItems = [
    { text: "Dashboard", path: "/admin" },
    { text: "Quản lý đợt đăng ký", path: "/admin/registration-periods" },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <Box sx={{ display: "flex", bgcolor: 'background.default', minHeight: '100vh' }}>
            <CssBaseline />
            
            {/* APPBAR: Sử dụng elevation 0 để trông hiện đại hơn hoặc 1 theo theme */}
            <AppBar position="fixed" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                        Dormitory Admin
                    </Typography>
                    <Button color="inherit" onClick={logout}>Logout</Button>
                </Toolbar>
            </AppBar>

            {/* SIDEBAR: Sử dụng cấu trúc Drawer chuẩn */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: DRAWER_WIDTH, 
                        boxSizing: "border-box",
                        borderRight: '1px solid',
                        borderColor: 'divider' // Sử dụng màu border chuẩn của MUI (đồng bộ với theme)
                    },
                }}
            >
                <Toolbar /> 
                <List sx={{ px: 2 }}>
                    {menuItems.map((item) => (
                        <ListItemButton 
                            key={item.text} 
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{ borderRadius: 2, mb: 1 }} // Đồng bộ borderRadius với theme
                        >
                            <ListItemText primary={item.text} sx={{ fontWeight: 600 }} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>

            {/* MAIN CONTENT: Tận dụng theme spacing */}
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Toolbar /> 
                <Outlet />
            </Box>
        </Box>
    );
}