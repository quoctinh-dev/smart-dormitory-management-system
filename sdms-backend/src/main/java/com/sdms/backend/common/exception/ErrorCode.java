package com.sdms.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Tập hợp toàn bộ mã lỗi (Error Code) đặc thù của hệ thống.
 * Đóng vai trò là "Single Source of Truth" cho các thông báo lỗi và mã trạng thái HTTP tương ứng,
 * giúp đồng bộ chặt chẽ cơ chế xử lý lỗi giữa Backend và các nền tảng Client (Web/Mobile).
 */
@Getter
public enum ErrorCode {
    // ==========================================
    // 1. Lỗi Hệ Thống & Toàn Cục
    // ==========================================
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra trong hệ thống"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tài nguyên này"),
    BAD_REQUEST_FORMAT(HttpStatus.BAD_REQUEST, "Cấu trúc dữ liệu gửi lên không đúng hoặc thiếu tham số bắt buộc"),
    DATA_CONFLICT(HttpStatus.CONFLICT, "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc hệ thống"),
    OPTIMISTIC_LOCK_FAILURE(HttpStatus.CONFLICT, "Phòng/Giường này vừa được người khác cập nhật. Vui lòng tải lại và thử lại!"),

    // ==========================================
    // 2. Lỗi Xác Thực & Phân Quyền
    // ==========================================
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không chính xác"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập của bạn đã hết hạn để đảm bảo an toàn. Vui lòng đăng nhập lại nhé!"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"),
    TOKEN_INVALID_OR_EXPIRED(HttpStatus.BAD_REQUEST, "Phiên đăng nhập không hợp lệ hoặc đã quá hạn. Vui lòng đăng nhập lại!"),
    REFRESH_TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Refresh Token không hợp lệ hoặc đã bị thu hồi"),

    // ==========================================
    // 3. Lỗi Tài Khoản & Người Dùng
    // ==========================================
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    ACCOUNT_PENDING_ACTIVATION(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt"),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa"),
    ACCOUNT_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "Tài khoản đã được kích hoạt từ trước"),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác"),
    CANNOT_LOCK_SELF(HttpStatus.FORBIDDEN, "Bạn không thể tự khóa tài khoản của chính mình"),
    CANNOT_LOCK_ADMIN(HttpStatus.FORBIDDEN, "Không thể khóa tài khoản của Quản trị viên hệ thống (ADMIN)"),
    CANNOT_TOGGLE_PENDING_ACCOUNT(HttpStatus.BAD_REQUEST, "Không thể thao tác trên tài khoản đang chờ kích hoạt. Sinh viên cần hoàn tất đăng ký!"),
    INVALID_ACCOUNT_STATE(HttpStatus.BAD_REQUEST, "Trạng thái tài khoản không hợp lệ cho thao tác này"),
    USERNAME_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại"),
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Email đã tồn tại"),
    STUDENT_PROFILE_NOT_FOUND(HttpStatus.BAD_REQUEST, "Tài khoản này không được liên kết với hồ sơ sinh viên nào"),

    // ==========================================
    // 4. Lỗi Quản Lý Phòng & Ký Túc Xá
    // ==========================================
    STUDENT_NOT_ELIGIBLE(HttpStatus.NOT_FOUND, "Sinh viên này đã hoàn tất nhận phòng trước đó hoặc chưa đóng lệ phí.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
