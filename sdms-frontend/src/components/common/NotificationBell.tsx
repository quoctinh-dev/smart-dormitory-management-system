import CircleIcon from '@mui/icons-material/Circle';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { notificationApi, NotificationResponse } from '@/api/notificationApi';
import { useAuth } from '@/auth';

export default function NotificationBell() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(
    null
  );

  useEffect(() => {
    if (!admin) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, [admin]);

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    if (!admin) return;

    setAnchorEl(event.currentTarget);
    setLoading(true);

    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    handleClose();

    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        );
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl.replace('/admin', ''));
    } else {
      setSelectedNotification(notification);
    }
  };

  const handleMarkAllRead = async () => {
    if (!admin) return;

    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();
  const hasUnread = unreadCount > 0;

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label="Mở thông báo"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: anchorEl ? 'action.selected' : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Badge
            badgeContent={displayCount}
            color="error"
            max={99}
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 18,
                height: 18,
                fontSize: '0.72rem',
                border: '2px solid',
                borderColor: 'background.paper',
              },
            }}
          >
            <NotificationsRoundedIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 24px)', sm: 390 },
              maxHeight: 540,
              borderRadius: 3,
              mt: 1.25,
              overflow: 'hidden',
              boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.3)',
            },
          },
        }}
        MenuListProps={{ sx: { p: 0 } }}
      >
        <Box
          sx={{
            p: 2,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.03))'
                : 'linear-gradient(90deg, rgba(96, 165, 250, 0.16), rgba(96, 165, 250, 0.04))',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Thông báo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasUnread ? `${unreadCount} thông báo mới` : 'Bạn đã xem hết thông báo'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {hasUnread && (
                <Button
                  size="small"
                  variant="text"
                  onClick={handleMarkAllRead}
                  startIcon={<MarkEmailReadRoundedIcon />}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  Đọc tất cả
                </Button>
              )}
            </Stack>
          </Stack>

          <Box
            sx={{
              mt: 1.5,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            <Stack direction="row" spacing={1} sx={{ width: 'max-content' }}>
              <Chip
                label="Tất cả"
                size="small"
                color={!filterType ? 'primary' : 'default'}
                variant={!filterType ? 'filled' : 'outlined'}
                onClick={() => setFilterType(null)}
              />
              <Chip
                label="Báo hỏng"
                size="small"
                color={filterType === 'MAINTENANCE' ? 'error' : 'default'}
                variant={filterType === 'MAINTENANCE' ? 'filled' : 'outlined'}
                onClick={() => setFilterType('MAINTENANCE')}
              />
              <Chip
                label="Đăng ký"
                size="small"
                color={filterType === 'APPLICATION' ? 'info' : 'default'}
                variant={filterType === 'APPLICATION' ? 'filled' : 'outlined'}
                onClick={() => setFilterType('APPLICATION')}
              />
              <Chip
                label="Thanh toán"
                size="small"
                color={filterType === 'PAYMENT' ? 'success' : 'default'}
                variant={filterType === 'PAYMENT' ? 'filled' : 'outlined'}
                onClick={() => setFilterType('PAYMENT')}
              />
              <Chip
                label="Cảnh báo"
                size="small"
                color={filterType === 'WARNING' ? 'warning' : 'default'}
                variant={filterType === 'WARNING' ? 'filled' : 'outlined'}
                onClick={() => setFilterType('WARNING')}
              />
              <Chip
                label="Hệ thống"
                size="small"
                color={filterType === 'SYSTEM' ? 'primary' : 'default'}
                variant={filterType === 'SYSTEM' ? 'filled' : 'outlined'}
                onClick={() => setFilterType('SYSTEM')}
              />
            </Stack>
          </Box>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          (() => {
            const filteredNotifications = filterType
              ? notifications.filter((n) => n.type === filterType)
              : notifications;

            if (filteredNotifications.length === 0) {
              return (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <NotificationsRoundedIcon sx={{ fontSize: 36, mb: 1, opacity: 0.7 }} />
                  <Typography variant="body2">Không có thông báo nào.</Typography>
                </Box>
              );
            }

            return filteredNotifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  whiteSpace: 'normal',
                  '&:hover': {
                    bgcolor: notification.isRead ? 'action.hover' : 'action.selected',
                  },
                }}
              >
                {!notification.isRead && (
                  <CircleIcon
                    sx={{ fontSize: 10, color: 'primary.main', mt: 0.8, flexShrink: 0 }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={notification.isRead ? 500 : 700}
                    sx={{ mb: 0.4 }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.3,
                      mb: 0.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              </MenuItem>
            ));
          })()
        )}
      </Menu>

      <Dialog
        open={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>{selectedNotification?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
            {selectedNotification?.message}
          </DialogContentText>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            {selectedNotification &&
              new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNotification(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
