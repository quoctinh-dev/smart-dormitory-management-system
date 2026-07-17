package com.sdms.backend.modules.face.enums;

/**
 * Các trạng thái vòng đời cho root aggregate FaceProfile.
 *
 * <p>Các trạng thái chuyển đổi hợp lệ:
 * <pre>
 *   [Sinh viên Upload] → CHỜ DUYỆT
 *   CHỜ DUYỆT          → ĐÃ DUYỆT    (Admin duyệt)
 *   CHỜ DUYỆT          → BỊ TỪ CHỐI  (Admin từ chối)
 *   ĐÃ DUYỆT           → BỊ THU HỒI  (Admin thu hồi)
 *   BỊ TỪ CHỐI         → CHỜ DUYỆT   (Sinh viên upload lại)
 *   BỊ THU HỒI         → CHỜ DUYỆT   (Sinh viên upload lại)
 * </pre>
 *
 * <p>NOT_REGISTERED bị cố tình loại trừ:
 * sự vắng mặt của bản ghi FaceProfile đại diện cho trạng thái chưa đăng ký.
 */
public enum FaceProfileStatus {
    PENDING,
    APPROVED,
    REJECTED,
    REVOKED
}
