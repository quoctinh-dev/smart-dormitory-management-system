package com.sdms.backend.modules.smartaccess.security;

/**
 * Mục tiêu/Nghiệp vụ: Quản lý tập trung các hằng số quyền hạn (Capabilities) riêng biệt cho module Smart Access.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng mô hình Cấp quyền dựa trên Tính năng (Capability-Based Access Control) thay vì Dựa trên Vai trò truyền thống (Role-Based Access Control).
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Hệ thống không dùng cấu trúc cứng nhắc như `hasRole('ADMIN')` vì vai trò có thể thay đổi (VD: Quản lý tòa A được mở cửa, nhưng không được mở tòa B).
 * - Bằng cách định nghĩa các quyền siêu nhỏ (Granular Capabilities) như `REMOTE_UNLOCK`, ta có thể linh hoạt gán quyền này cho bất kỳ Role nào ở database mà không cần sửa code.
 */
public final class SmartAccessPermissions {
    
    private SmartAccessPermissions() {}

    // Quyền hạn cho phép quản lý chính sách kiểm soát truy cập
    public static final String MANAGE_CURFEW_POLICY = "hasAuthority('MANAGE_CURFEW_POLICY')";
    public static final String MANAGE_TIME_WINDOW_POLICY = "hasAuthority('MANAGE_TIME_WINDOW_POLICY')";
    public static final String VIEW_ACCESS_HISTORY = "hasAuthority('VIEW_ACCESS_HISTORY')";
    public static final String REMOTE_UNLOCK = "hasAuthority('REMOTE_UNLOCK')";
    public static final String EMERGENCY_OVERRIDE = "hasAuthority('EMERGENCY_OVERRIDE')";
}
