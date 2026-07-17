package com.sdms.backend.modules.face.permission;

/**
 * Các hằng số quyền tập trung cho Module Face.
 *
 * <p>QUẢN TRỊ: Tất cả các annotation @PreAuthorize trong FaceStudentController
 * và FaceAdminController CHỈ ĐƯỢC PHÉP tham chiếu các hằng số này.
 * Không cho phép sử dụng các chuỗi "hasRole(...)" hoặc "hasAuthority(...)" nội tuyến.
 *
 * <p>Quyền sở hữu tác nhân theo ACTOR-MATRIX-01:
 * <ul>
 *   <li>FACE_REGISTER   → Sinh viên</li>
 *   <li>FACE_VIEW_SELF  → Sinh viên</li>
 *   <li>FACE_VIEW_ALL   → Admin</li>
 *   <li>FACE_APPROVE    → Admin</li>
 *   <li>FACE_REJECT     → Admin</li>
 *   <li>FACE_REVOKE     → Admin</li>
 * </ul>
 */
public final class FacePermissions {

    private FacePermissions() {}

    // ─── Quyền Sinh Viên ──────────────────────────────────────────────────────

    /** Cho phép tải lên hoặc tải lại ảnh chân dung. */
    public static final String FACE_REGISTER  = "hasAuthority('FACE_REGISTER')";

    /** Cho phép sinh viên xem trạng thái hồ sơ khuôn mặt của chính họ. */
    public static final String FACE_VIEW_SELF = "hasAuthority('FACE_VIEW_SELF')";

    // ─── Quyền Admin ──────────────────────────────────────────────────────────

    /** Cho phép admin xem tất cả các hồ sơ khuôn mặt và hàng đợi chờ duyệt. */
    public static final String FACE_VIEW_ALL  = "hasAuthority('FACE_VIEW_ALL')";

    /** Cho phép admin duyệt hồ sơ CHỜ DUYỆT và kích hoạt trích xuất AI. */
    public static final String FACE_APPROVE   = "hasAuthority('FACE_APPROVE')";

    /** Cho phép admin từ chối hồ sơ CHỜ DUYỆT. */
    public static final String FACE_REJECT    = "hasAuthority('FACE_REJECT')";

    /** Cho phép admin thu hồi hồ sơ ĐÃ DUYỆT và vô hiệu hóa truy cập cổng. */
    public static final String FACE_REVOKE    = "hasAuthority('FACE_REVOKE')";
}
