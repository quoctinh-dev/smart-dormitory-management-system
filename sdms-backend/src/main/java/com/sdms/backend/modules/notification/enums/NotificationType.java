package com.sdms.backend.modules.notification.enums;

public enum NotificationType {
    APPLICATION,
    PAYMENT,
    ROOM,
    SYSTEM,
    WARNING,
    ANNOUNCEMENT,
    MAINTENANCE,
    /** Cảnh báo sự cố phần cứng IoT: ESP32 gửi lên khi mất kết nối Camera/Đầu đọc thẻ */
    IOT_HARDWARE_ERROR
}