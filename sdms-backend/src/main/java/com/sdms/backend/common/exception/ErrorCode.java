package com.sdms.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không chính xác"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"),
    REFRESH_TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Refresh Token không hợp lệ hoặc đã bị thu hồi"),
    ACCOUNT_PENDING_ACTIVATION(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt"),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa"),
    ACCOUNT_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "Tài khoản đã được kích hoạt từ trước"),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không chính xác"),
    TOKEN_INVALID_OR_EXPIRED(HttpStatus.BAD_REQUEST, "Token không hợp lệ hoặc đã hết hạn"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tài nguyên này"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),
    STUDENT_NOT_ELIGIBLE(HttpStatus.NOT_FOUND, "Sinh viên này đã hoàn tất nhận phòng trước đó hoặc chưa đóng lệ phí."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi xảy ra trong hệ thống");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
