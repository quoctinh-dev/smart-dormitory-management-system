package com.sdms.backend.modules.notification.enums;

public enum NotificationType {
    // Nhóm do admin tạo ra
    ANNOUNCEMENT,

    // nhóm do hệ thống tự động tạo ra
    SYSTEM,

    // nhóm do người dùng tạo ra ( mà có 1 số cái là do hệ thống tạo ra nhưng vẫn thuộc nhóm này )
    APPLICATION,
    ROOM,
    MAINTENANCE,
    IOT_HARDWARE_ERROR,
    PAYMENT,
    ELECTRIC_FEE,
    ACCOMMODATION_FEE,
    PENALTY_FEE
}