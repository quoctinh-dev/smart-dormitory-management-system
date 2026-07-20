import { useState, useCallback, useEffect } from 'react';

import notificationApi from '@/api/notification-api';
import type { NotificationResponse } from '@/types/notification';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);

      setNotifications(listRes || []);
      setUnreadCount(countRes || 0);
    } catch (error: any) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      // TỐI ƯU GIAO DIỆN: Thêm Polling nhẹ (Lightweight Polling) mỗi 30s 
      // để cập nhật số lượng thông báo (Unread Count) tạo cảm giác Real-time cho hệ thống
      const interval = setInterval(async () => {
        try {
          const newCount = await notificationApi.getUnreadCount();
          if (newCount !== unreadCount) {
             setUnreadCount(newCount);
             // Chỉ fetch lại list nếu có thông báo mới (tránh gọi API thừa)
             if (newCount > unreadCount) {
                 const newList = await notificationApi.getNotifications();
                 setNotifications(newList || []);
             }
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, fetchNotifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
