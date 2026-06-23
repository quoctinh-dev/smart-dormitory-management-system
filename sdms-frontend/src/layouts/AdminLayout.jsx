import { 
  AppBar, Toolbar, Typography, Box, Drawer, List, 
  ListItemButton, ListItemText, Button, CssBaseline 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth';

const DRAWER_WIDTH = 260;

const MENU_ITEMS = [
  { text: 'Dashboard', path: '/admin' },
  { text: 'Quản lý đợt đăng ký', path: '/admin/registration-periods' },
  { text: 'Kiểm duyệt hồ sơ', path: '/admin/applications/review' },
  { text: 'Kiểm duyệt khuôn mặt', path: '/admin/faces/approve' },
  { text: 'Sơ đồ Giường/Phòng', path: '/admin/rooms/dashboard' },
  { text: 'Quản lý Thanh toán', path: '/admin/payments' },
  { text: 'Lễ tân Check-in', path: '/admin/check-in' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* APPBAR */}
      <AppBar position="fixed" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Dormitory Admin
          </Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: DRAWER_WIDTH, 
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <Toolbar /> 
        <List sx={{ px: 2 }}>
          {MENU_ITEMS.map((item) => {
            const isSelected = location.pathname === item.path;
            
            return (
              <ListItemButton 
                key={item.text} 
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
        
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: isSelected ? 700 : 500 
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar /> 
        <Outlet />
      </Box>
    </Box>
  );
}