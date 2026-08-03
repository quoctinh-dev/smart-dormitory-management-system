import CircleIcon from '@mui/icons-material/Circle';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import RoomPreferencesRoundedIcon from '@mui/icons-material/RoomPreferencesRounded';
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
  Avatar,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';

import { notificationApi } from '@/api/notification-api';
import { useAuth } from '@/providers/AuthProvider';
import type { NotificationResponse } from '@/types/notification';

export default function NotificationBell() {
  const { user } = useAuth();
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
    if (!user) return;

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
  }, [user]);

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    if (!user) return;

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
    if (!user) return;

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
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: anchorEl ? 'action.selected' : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
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
                    fontSize: '0.7rem',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  },
                }}
            >
              <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
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
                variant: 'outlined',
                sx: {
                  width: { xs: 'calc(100vw - 24px)', sm: 390 },
                  maxHeight: 540,
                  borderRadius: 2,
                  mt: 1.25,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.15)',
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
                        ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.01))'
                        : 'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(96, 165, 250, 0.02))',
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
                        disableElevation
                        sx={{ minWidth: 'auto', px: 1, textTransform: 'none', fontWeight: 600 }}
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
                {[
                  { label: 'Tất cả', value: null },
                  { label: 'Chung', value: 'ANNOUNCEMENT' },
                  { label: 'Báo hỏng', value: 'MAINTENANCE' },
                  { label: 'Đăng ký', value: 'APPLICATION' },
                  { label: 'Thanh toán', value: 'PAYMENT' },
                  { label: 'Cảnh báo IoT', value: 'IOT_HARDWARE_ERROR' },
                  { label: 'Hệ thống', value: 'SYSTEM' },
                  { label: 'Phòng ở', value: 'ROOM' },
                ].map((tab) => {
                  const active = filterType === tab.value;
                  return (
                      <Chip
                          key={tab.label}
                          label={tab.label}
                          size="small"
                          variant={active ? 'filled' : 'outlined'}
                          onClick={() => setFilterType(tab.value)}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: active ? 600 : 400,
                            textTransform: 'none',
                            ...(active && {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                              color: 'primary.main',
                              borderColor: 'primary.main',
                            }),
                          }}
                      />
                  );
                })}
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

                const getNotificationIcon = (type: string) => {
                  switch (type) {
                    case 'MAINTENANCE':
                      return <BuildCircleRoundedIcon sx={{ color: 'warning.main', fontSize: 24 }} />;
                    case 'PAYMENT':
                      return <PaymentRoundedIcon sx={{ color: 'success.main', fontSize: 24 }} />;
                    case 'IOT_HARDWARE_ERROR':
                      return <WarningAmberRoundedIcon sx={{ color: 'error.main', fontSize: 24 }} />;
                    case 'ELECTRIC_FEE':
                    case 'ACCOMMODATION_FEE':
                    case 'PENALTY_FEE':
                      return <PaymentRoundedIcon sx={{ color: 'error.main', fontSize: 24 }} />;
                    case 'APPLICATION':
                      return <ArticleRoundedIcon sx={{ color: 'info.main', fontSize: 24 }} />;
                    case 'ROOM':
                      return <RoomPreferencesRoundedIcon sx={{ color: 'secondary.main', fontSize: 24 }} />;
                    default:
                      return <InfoRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />;
                  }
                };
                
                const getIconBackground = (type: string, t: any) => {
                  switch (type) {
                    case 'MAINTENANCE':
                      return alpha(t.palette.warning.main, 0.1);
                    case 'PAYMENT':
                      return alpha(t.palette.success.main, 0.1);
                    case 'IOT_HARDWARE_ERROR':
                    case 'ELECTRIC_FEE':
                    case 'ACCOMMODATION_FEE':
                    case 'PENALTY_FEE':
                      return alpha(t.palette.error.main, 0.1);
                    case 'APPLICATION':
                      return alpha(t.palette.info.main, 0.1);
                    case 'ROOM':
                      return alpha(t.palette.secondary.main, 0.1);
                    default:
                      return alpha(t.palette.primary.main, 0.1);
                  }
                };

                return filteredNotifications.map((notification) => (
                    <MenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          p: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: notification.isRead ? 'transparent' : (t) => alpha(t.palette.primary.main, 0.03),
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          whiteSpace: 'normal',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: notification.isRead ? 'action.hover' : (t) => alpha(t.palette.primary.main, 0.06),
                          },
                        }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            bgcolor: (t) => getIconBackground(notification.type, t),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                        {!notification.isRead && (
                            <CircleIcon
                                sx={{
                                  fontSize: 12,
                                  color: 'error.main',
                                  position: 'absolute',
                                  top: -2,
                                  right: -2,
                                  border: '2px solid',
                                  borderColor: 'background.paper',
                                  borderRadius: '50%',
                                }}
                            />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight={notification.isRead ? 500 : 700}
                            color={notification.isRead ? 'text.secondary' : 'text.primary'}
                            sx={{ mb: 0.5, lineHeight: 1.3 }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 0.75,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5,
                            }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                          {new Date(notification.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit', minute:'2-digit',
                            day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
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
            PaperProps={{
              variant: 'outlined',
              sx: { borderRadius: 2 }
            }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>{selectedNotification?.title}</DialogTitle>
          <DialogContent dividers>
            <DialogContentText sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
              {selectedNotification?.message}
            </DialogContentText>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              {selectedNotification &&
                  new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
                onClick={() => setSelectedNotification(null)}
                variant="contained"
                disableElevation
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}