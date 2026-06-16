package com.sdms.backend.modules.application.enums;

/**
 * Quản lý vòng đời của Đơn đăng ký KTX.
 * Vòng đời này quyết định luồng tạo Student.
 * Chỉ khi status chuyển sang APPROVED (đã đóng tiền và cấp phòng), hệ thống mới trigger tạo Student và UserAccount.
 */
public enum ApplicationStatus {
    PENDING,            // Mới submit đơn, chờ Admin xem xét
    UNDER_REVIEW,       // Admin đang trong quá trình xử lý
    REVISION_REQUIRED,  // Hồ sơ thiếu giấy tờ (VD: thiếu minh chứng hộ nghèo), cần bổ sung
    WAITING_PAYMENT,    // Đã duyệt hồ sơ, đang chờ sinh viên đóng tiền
    APPROVED,           // Hoàn tất (Đã đóng tiền) -> Trigger sinh dữ liệu Student
    REJECTED,           // Bị từ chối (Sai đối tượng, hết slot)
    WAITING_LIST,       // Đạt yêu cầu nhưng KTX hiện hết chỗ, đưa vào danh sách chờ
    EXPIRED             // Quá hạn (thanh toán hoặc bổ sung hồ sơ)
}