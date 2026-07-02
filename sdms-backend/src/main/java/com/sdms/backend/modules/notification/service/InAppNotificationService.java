package com.sdms.backend.modules.notification.service;

import com.sdms.backend.modules.notification.dto.NotificationResponse;

import java.util.List;

public interface InAppNotificationService {
    List<NotificationResponse> getUserNotifications();
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
}
