import AssignmentIcon from '@mui/icons-material/Assignment';
import BedIcon from '@mui/icons-material/Bed';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FaceIcon from '@mui/icons-material/Face';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import SensorsIcon from '@mui/icons-material/Sensors';
import SettingsIcon from '@mui/icons-material/Settings';
import DomainIcon from '@mui/icons-material/Domain';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockClockIcon from '@mui/icons-material/LockClock';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';

const DRAWER_WIDTH = 260; // Kích thước chuẩn
const COLLAPSED_WIDTH = 76;

type MenuItem = {
  text: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  color?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { text: 'Dashboard', path: '/admin', icon: <DashboardIcon fontSize="medium" />, roles: ['ADMIN'] },
      { text: 'Lịch sử thông báo', path: '/admin/notifications', icon: <NotificationsIcon fontSize="medium" />, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'QUẢN LÝ LƯU TRÚ',
    items: [
      { text: 'Quản lý sinh viên', path: '/admin/students', icon: <PeopleIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý giường & phòng', path: '/admin/rooms', icon: <BedIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Kiểm duyệt hồ sơ', path: '/admin/applications/review', icon: <FactCheckIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Lễ tân check-in', path: '/admin/check-in', icon: <HowToRegIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Yêu cầu đổi phòng', path: '/admin/change-room', icon: <SwapHorizIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý gia hạn', path: '/admin/extension-requests', icon: <MoreTimeIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý trả phòng', path: '/admin/checkout-requests', icon: <ExitToAppIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý đợt đăng ký', path: '/admin/registration-periods', icon: <EventNoteIcon fontSize="medium" />, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'TÀI CHÍNH & DỊCH VỤ',
    items: [
      { text: 'Quản lý thanh toán', path: '/admin/payments', icon: <PaymentIcon fontSize="medium" />, roles: ['ADMIN'] },
      { text: 'Chốt chỉ số Tiện ích', path: '/admin/electricity', icon: <ReceiptLongIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
    ],
  },
  {
    title: 'HỆ THỐNG & AN NINH',
    items: [
      { text: 'Quản lý tài khoản', path: '/admin/accounts', icon: <ManageAccountsIcon fontSize="medium" />, roles: ['ADMIN'] },
      { text: 'Kiểm duyệt khuôn mặt', path: '/admin/faces/approve', icon: <FaceIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý thiết bị Cổng', path: '/admin/gates', icon: <SensorsIcon fontSize="medium" />, roles: ['ADMIN'] },
      { text: 'Log cửa thông minh', path: '/admin/smart-access', icon: <VpnKeyIcon fontSize="medium" />, roles: ['ADMIN', 'STAFF'] },
      { text: 'Quản lý chính sách', path: '/admin/smart-access/policies', icon: <LockClockIcon fontSize="medium" />, roles: ['ADMIN'] },
      { text: 'Cấu hình hệ thống', path: '/admin/system-configs', icon: <SettingsIcon fontSize="medium" />, roles: ['ADMIN'] },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({
                                       mobileOpen,
                                       onMobileClose,
                                       collapsed,
                                       onToggleCollapse,
                                     }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase() || '';

  const filteredGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(userRole)),
  })).filter((group) => group.items.length > 0);

  const drawerContent = (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', bgcolor: 'background.paper' }}>
        {/* Brand Header: Thay thế logo aurora thành thương hiệu STU Dorm chuẩn */}
        <Box
            sx={{
              p: collapsed ? 2 : 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderBottom: '1px solid',
              borderColor: 'divider',
              height: 72,
              boxSizing: 'border-box',
              overflow: 'hidden',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            }}
        >
          <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                minWidth: 36,
                height: 36,
                boxShadow: 2,
              }}
          >
            <DomainIcon fontSize="small" />
          </Box>
          {!collapsed && (
              <Box>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}
                >
                  STU Dormitory
                </Typography>
              </Box>
          )}
        </Box>

        {/* Menu List: Tăng kích thước chữ và khoảng cách dễ bấm */}
        <List
            sx={{
              px: collapsed ? 1.5 : 2,
              py: 2,
              flexGrow: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' },
            }}
        >
          {filteredGroups.map((group, groupIndex) => (
              <React.Fragment key={group.title}>
                {!collapsed && (
                    <Typography
                        variant="overline"
                        sx={{
                          display: 'block',
                          px: 1.5,
                          mt: groupIndex === 0 ? 0 : 3,
                          mb: 1.5,
                          color: 'primary.main', // Chuyển từ text.secondary sang màu chủ đạo cho nổi
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '1px',
                          lineHeight: 1.2,
                          fontFamily: 'inherit',
                          textRendering: 'optimizeLegibility',
                          WebkitFontSmoothing: 'antialiased',
                        }}
                    >
                      {group.title}
                    </Typography>
                )}
                {collapsed && groupIndex > 0 && (
                    <Box sx={{ my: 2, borderTop: '1px solid', borderColor: 'divider' }} />
                )}

                {group.items.map((item) => {
                  let isSelected = false;
                  if (item.path === '/admin') {
                      isSelected = location.pathname === '/admin';
                  } else if (item.path === '/admin/smart-access') {
                      isSelected = location.pathname === '/admin/smart-access' || 
                                   (location.pathname.startsWith('/admin/smart-access/') && !location.pathname.startsWith('/admin/smart-access/policies'));
                  } else {
                      isSelected = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  }

                  const listItemButton = (
                      <ListItemButton
                          key={item.text}
                          selected={isSelected}
                          onClick={() => {
                            navigate(item.path);
                            onMobileClose();
                          }}
                          sx={{
                            borderRadius: 2.5,
                            mb: 0.8,
                            py: 1.2,
                            px: collapsed ? 0 : 2,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                              '& .MuiListItemIcon-root': {
                                color: 'primary.contrastText',
                              },
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              },
                            },
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              '& .MuiListItemIcon-root': {
                                color: 'primary.main',
                              },
                            },
                          }}
                      >
                        <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: collapsed ? 0 : 2,
                              justifyContent: 'center',
                              color: isSelected ? 'primary.contrastText' : 'primary.main',
                            }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                  fontSize: '0.95rem',
                                  fontWeight: isSelected ? 700 : 600,
                                  color: isSelected ? 'inherit' : 'text.primary',
                                }}
                            />
                        )}
                      </ListItemButton>
                  );

                  return collapsed ? (
                      <Tooltip key={item.text} title={item.text} placement="right" arrow>
                        {listItemButton}
                      </Tooltip>
                  ) : (
                      listItemButton
                  );
                })}
              </React.Fragment>
          ))}
        </List>

        {/* Toggle Collapse Button for Desktop */}
        <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: { xs: 'none', md: 'flex' },
              justifyContent: collapsed ? 'center' : 'flex-end',
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
            }}
        >
          <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                p: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
          >
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
  );

  return (
      <Box
          component="nav"
          sx={{
            width: { md: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH },
            flexShrink: { md: 0 },
            transition: 'width 0.25s ease',
          }}
      >
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
                boxShadow: 3,
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
                width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
                borderRight: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: 'none',
                overflowX: 'hidden',
                transition: 'width 0.25s ease',
              },
            }}
            open
        >
          {drawerContent}
        </Drawer>
      </Box>
  );
}