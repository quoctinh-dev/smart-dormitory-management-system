package com.sdms.backend.modules.application.enums;

/**
 * Quản lý vòng đời của Đơn đăng ký KTX (Đã được đóng băng theo SDMS V1).
 */
public enum ApplicationStatus {
    PENDING,            // Mới submit đơn, chờ Admin xem xét
    UNDER_REVIEW,       // Admin đang trong quá trình xử lý tài liệu
    REQUEST_REVISION,   // Yêu cầu bổ sung tài liệu sai (Có thời hạn)
    WAITING_PAYMENT,    // Đã duyệt hồ sơ và đặt giường, đang chờ sinh viên đóng tiền
    APPROVED,           // Hoàn tất (Đã đóng tiền)
    REJECTED,           // Bị từ chối (Sai đối tượng, sai tài liệu...)
    WAITING_LIST,       // Đạt yêu cầu nhưng KTX hiện hết chỗ, đưa vào danh sách chờ
    EXPIRED             // Quá hạn thanh toán 3 ngày
}