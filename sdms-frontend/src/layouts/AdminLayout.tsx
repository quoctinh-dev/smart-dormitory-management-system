// --- REFACTOR: Tối ưu import icon ---
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BedIcon from '@mui/icons-material/Bed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventRepeat from '@mui/icons-material/EventRepeat';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FaceIcon from '@mui/icons-material/Face';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import SensorsIcon from '@mui/icons-material/Sensors';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CssBaseline,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth';
import NotificationBell from '@/components/common/NotificationBell';

const DRAWER_WIDTH = 260;

type MenuItem = {
  text: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    title: 'Tổng quan',
    items: [
      { text: 'Dashboard', path: '/admin', icon: <DashboardIcon />, roles: ['ADMIN'] },
      { text: 'Lịch sử thông báo', path: '/admin/notifications', icon: <NotificationsIcon />, roles: ['ADMIN'] },
    ]
  },
  {
    title: 'Quản lý Lưu trú',
    items: [
      { text: 'Quản lý giường & phòng', path: '/admin/rooms', icon: <BedIcon />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Yêu cầu đổi phòng', path: '/admin/change-room', icon: <EventRepeat />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý đợt đăng ký', path: '/admin/registration-periods', icon: <DateRangeIcon />, roles: ['ADMIN'] },
      { text: 'Kiểm duyệt hồ sơ', path: '/admin/applications/review', icon: <AssignmentTurnedInIcon />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Lễ tân check-in', path: '/admin/check-in', icon: <RoomPreferencesIcon />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý gia hạn', path: '/admin/extension-requests', icon: <EventRepeat />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý trả phòng', path: '/admin/checkout-requests', icon: <ExitToAppIcon />, roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'Tài chính & Dịch vụ',
    items: [
      { text: 'Quản lý thanh toán', path: '/admin/payments', icon: <PaymentIcon />, roles: ['ADMIN'] },
      { text: 'Chốt chỉ số Tiện ích', path: '/admin/electricity', icon: <AssignmentTurnedInIcon />, roles: ['ADMIN', 'STAFF'] }, // New item placeholder
    ]
  },
  {
    title: 'Hệ thống & An ninh',
    items: [
      { text: 'Quản lý tài khoản', path: '/admin/accounts', icon: <PeopleIcon />, roles: ['ADMIN'] },
      { text: 'Kiểm duyệt khuôn mặt', path: '/admin/faces/approve', icon: <FaceIcon />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý thiết bị Cổng', path: '/admin/gates', icon: <SensorsIcon />, roles: ['ADMIN'] },
      { text: 'Log cửa thông minh', path: '/admin/smart-access', icon: <AssignmentTurnedInIcon />, roles: ['ADMIN'] },
      { text: 'Cấu hình hệ thống', path: '/admin/system-configs', icon: <SettingsIcon />, roles: ['ADMIN'] },
    ]
  }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  
  const userRole = admin?.role?.toUpperCase() || '';

  // Filter groups and items based on user role
  const filteredGroups = MENU_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(userRole))
  })).filter(group => group.items.length > 0);

  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              letterSpacing: '-0.5px',
            }}
          >
            Dormitory admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBell />
            <Button
              color="error"
              variant="text"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ fontWeight: 600 }}
            >
              Đăng xuất
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

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
            bgcolor: 'background.paper',
          },
        }}
      >
        <Toolbar />
        <List sx={{ px: 2, mt: 2 }}>
          {filteredGroups.map((group, groupIndex) => (
            <React.Fragment key={group.title}>
              {/* Group Header */}
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  px: 2,
                  mt: groupIndex === 0 ? 0 : 2,
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 700,
                  lineHeight: 1.2
                }}
              >
                {group.title}
              </Typography>
              
              {/* Group Items */}
              {group.items.map((item) => {
                const isSelected =
                  location.pathname === item.path ||
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));

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
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isSelected ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, minWidth: 0 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
