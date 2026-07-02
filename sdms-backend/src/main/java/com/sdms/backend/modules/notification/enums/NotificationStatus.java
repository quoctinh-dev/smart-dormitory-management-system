package com.sdms.backend.modules.notification.enums;

public enum NotificationStatus {
    PENDING, // Chờ xử lý ngầm
    SENT,    // Đã đẩy sang cổng API thành công
    FAILED   // Gửi thất bại
}