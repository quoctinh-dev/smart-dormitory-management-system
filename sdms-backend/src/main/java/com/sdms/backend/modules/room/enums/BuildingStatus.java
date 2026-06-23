package com.sdms.backend.modules.room.enums;

/**
 * TRẠNG THÁI TÒA NHÀ:
 * - ACTIVE: Đang hoạt động, sinh viên có thể đăng ký.
 * - MAINTENANCE: Đang bảo trì, tạm dừng mọi hoạt động.
 * - CLOSED: Ngừng sử dụng hoàn toàn (ví dụ: tòa nhà cũ hoặc bị thu hồi).
 */
public enum BuildingStatus {
    ACTIVE,
    MAINTENANCE,
    CLOSED
}