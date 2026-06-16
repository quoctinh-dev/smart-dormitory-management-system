package com.sdms.backend.modules.user.enums;

/**
 * Quản lý vòng đời trạng thái của một tài khoản.
 */
public enum AccountStatus {
    PENDING_ACTIVATION, // Tài khoản vừa được hệ thống auto-generate, sinh viên chưa đăng nhập lần đầu/đổi mật khẩu
    ACTIVE,             // Tài khoản đang hoạt động bình thường
    LOCKED              // Tài khoản bị khóa (ví dụ: do nợ tiền phòng quá hạn hoặc vi phạm kỷ luật)
}