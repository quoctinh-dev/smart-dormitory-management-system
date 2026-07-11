package com.sdms.backend.modules.notification.service;

import com.sdms.backend.modules.notification.dto.NotificationResponse;

import com.sdms.backend.modules.notification.dto.IssueReportRequest;
import java.util.List;

public interface InAppNotificationService {
    List<NotificationResponse> getUserNotifications();
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
    void reportIssue(IssueReportRequest request);
}
