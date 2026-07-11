package com.sdms.backend.modules.room.enums;

/**
 * Quản lý vòng đời (Lifecycle) của một lượt phân bổ phòng.
 */
public enum AssignmentStatus {
    /**
     * Đã giữ chỗ thành công, đang trong thời gian chờ sinh viên thanh toán (hạn 3 ngày).
     */
    RESERVED,

    /**
     * Sinh viên đã thanh toán thành công, hồ sơ sinh viên đã được liên kết, chờ làm thủ tục Check-in thực tế.
     */
    PENDING_CHECKIN,

    /**
     * Sinh viên đã làm thủ tục Check-in và đang sinh sống thực tế tại phòng/giường.
     */
    OCCUPIED,

    /**
     * Sinh viên đã làm thủ tục trả phòng (Check-out) thành công.
     */
    CHECKED_OUT,

    /**
     * Sinh viên đã chuyển sang phòng/giường khác (Đổi phòng hoặc Di dời bảo trì).
     * Trạng thái này giúp phân biệt với CHECKED_OUT (Rời KTX) để thống kê chính xác.
     */
    TRANSFERRED,

    /**
     * Đơn phân bổ bị hủy thủ công hoặc sinh viên từ chối nhận chỗ.
     */
    CANCELLED,

    /**
     * Giữ chỗ hết hạn do sinh viên không thanh toán đúng thời hạn (3 ngày).
     */
    EXPIRED
}