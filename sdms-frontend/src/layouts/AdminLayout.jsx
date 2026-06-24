// src/layouts/AdminLayout.jsx
import React from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Drawer, List, 
  ListItemButton, ListItemIcon, ListItemText, Button, CssBaseline 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FaceIcon from '@mui/icons-material/Face';
import BedIcon from '@mui/icons-material/Bed';
import PaymentIcon from '@mui/icons-material/Payment';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '@/auth';

const DRAWER_WIDTH = 260;

const MENU_ITEMS = [
  { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
  { text: 'Quản lý đợt đăng ký', path: '/admin/registration-periods', icon: <DateRangeIcon /> },
  { text: 'Kiểm duyệt hồ sơ', path: '/admin/applications/review', icon: <AssignmentTurnedInIcon /> },
  { text: 'Kiểm duyệt khuôn mặt', path: '/admin/faces/approve', icon: <FaceIcon /> },
  { text: 'Quản lý Giường & Phòng', path: '/admin/rooms', icon: <BedIcon /> },
  { text: 'Quản lý Thanh toán', path: '/admin/payments', icon: <PaymentIcon /> },
  { text: 'Lễ tân Check-in', path: '/admin/check-in', icon: <RoomPreferencesIcon /> },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* APPBAR */}
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px' }}>
            Dormitory Admin
          </Typography>
          <Button 
            color="error" 
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ fontWeight: 600 }}
          >
            Đăng xuất
          </Button>
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
            borderColor: 'divider',
            bgcolor: 'background.paper'
          },
        }}
      >
        <Toolbar /> 
        <List sx={{ px: 2, mt: 2 }}>
          {MENU_ITEMS.map((item) => {
            // Kiểm tra trạng thái Active chính xác kể cả với đường dẫn con hoặc đường dẫn chính
            const isSelected = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <ListItemButton 
                key={item.text} 
                selected={isSelected}
                onClick={() => navigate(item.path)}
                sx={{ 
                  borderRadius: '12px', 
                  mb: 1,
                  py: 1,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    },
                  },
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}
              >
                {/* Thêm Icon để tăng trải nghiệm UI người dùng */}
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>

                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'primary.main' : 'text.secondary'
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, minWidth: 0 }}>
        <Toolbar /> 
        <Outlet />
      </Box>
    </Box>
  );
}