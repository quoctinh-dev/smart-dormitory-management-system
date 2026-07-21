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

    /**
     * Broadcast hardware error alert to all ADMINs.
     * Called when ESP32 reports a sensor/reader failure.
     */
    void notifyHardwareError(String gateId, String gateName, String component, String detail);
}
