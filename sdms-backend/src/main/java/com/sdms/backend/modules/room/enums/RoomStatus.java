package com.sdms.backend.modules.room.enums;

/**
 * TRẠNG THÁI PHÒNG:
 * - AVAILABLE: Còn chỗ cho sinh viên đăng ký.
 * - FULL: Đã hết giường.
 * - MAINTENANCE: Đang bảo trì (không thể đăng ký).
 * - CLOSED: Phòng ngừng sử dụng hoàn toàn.
 */
public enum RoomStatus {
    AVAILABLE,
    FULL,
    MAINTENANCE,
    CLOSED
}