package com.sdms.backend.modules.student.enums;

public enum StudentStatus {
    PENDING_CHECKIN, // Đã thanh toán, chờ nhận phòng
    ACTIVE,          // Đang cư trú
    GRADUATED,       // Đã ra trường
    INACTIVE         // Đã trả phòng/Nghỉ học
}
