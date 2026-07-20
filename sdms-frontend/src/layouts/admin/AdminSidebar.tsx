import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BedIcon from '@mui/icons-material/Bed';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventRepeat from '@mui/icons-material/EventRepeat';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FaceIcon from '@mui/icons-material/Face';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import SensorsIcon from '@mui/icons-material/Sensors';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import { useAuth } from '@/providers/AuthProvider';

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
      {
        text: 'Lịch sử thông báo',
        path: '/admin/notifications',
        icon: <NotificationsIcon />,
        roles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'Quản lý Lưu trú',
    items: [
      {
        text: 'Quản lý giường & phòng',
        path: '/admin/rooms',
        icon: <BedIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Yêu cầu đổi phòng',
        path: '/admin/change-room',
        icon: <EventRepeat />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Quản lý đợt đăng ký',
        path: '/admin/registration-periods',
        icon: <DateRangeIcon />,
        roles: ['ADMIN'],
      },
      {
        text: 'Kiểm duyệt hồ sơ',
        path: '/admin/applications/review',
        icon: <AssignmentTurnedInIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Lễ tân check-in',
        path: '/admin/check-in',
        icon: <RoomPreferencesIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Quản lý gia hạn',
        path: '/admin/extension-requests',
        icon: <EventRepeat />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Quản lý trả phòng',
        path: '/admin/checkout-requests',
        icon: <ExitToAppIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
    ],
  },
  {
    title: 'Tài chính & Dịch vụ',
    items: [
      {
        text: 'Quản lý thanh toán',
        path: '/admin/payments',
        icon: <PaymentIcon />,
        roles: ['ADMIN'],
      },
      {
        text: 'Chốt chỉ số Tiện ích',
        path: '/admin/electricity',
        icon: <AssignmentTurnedInIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
    ],
  },
  {
    title: 'Hệ thống & An ninh',
    items: [
      {
        text: 'Quản lý tài khoản',
        path: '/admin/accounts',
        icon: <PeopleIcon />,
        roles: ['ADMIN'],
      },
      {
        text: 'Kiểm duyệt khuôn mặt',
        path: '/admin/faces/approve',
        icon: <FaceIcon />,
        roles: ['ADMIN', 'STAFF'],
      },
      {
        text: 'Quản lý thiết bị Cổng',
        path: '/admin/gates',
        icon: <SensorsIcon />,
        roles: ['ADMIN'],
      },
      {
        text: 'Log cửa thông minh',
        path: '/admin/smart-access',
        icon: <AssignmentTurnedInIcon />,
        roles: ['ADMIN'],
      },
      {
        text: 'Cấu hình hệ thống',
        path: '/admin/system-configs',
        icon: <SettingsIcon />,
        roles: ['ADMIN'],
      },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase() || '';

  const filteredGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(userRole)),
  })).filter((group) => group.items.length > 0);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Logo />
      </Box>
      <List sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {filteredGroups.map((group, groupIndex) => (
          <React.Fragment key={group.title}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                px: 2,
                mt: groupIndex === 0 ? 0 : 2,
                mb: 1,
                color: 'text.secondary',
                fontWeight: 'bold',
                lineHeight: 1.2,
              }}
            >
              {group.title}
            </Typography>
            {group.items.map((item) => {
              const isSelected =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));

              return (
                <ListItemButton
                  key={item.text}
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    onMobileClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    py: 1.2,
                    px: 2,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                      '&:hover': {
                        bgcolor: 'primary.dark',
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
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none',
            boxShadow: 1,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '2px 0 12px rgba(0,0,0,0.02)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
