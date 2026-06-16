package com.sdms.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Exception tùy chỉnh cho các lỗi nghiệp vụ trong ứng dụng.
 * Kế thừa từ RuntimeException để không bắt buộc phải try-catch.
 */
@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    /**
     * Constructor mới cho phép truyền vào cả exception gốc (cause).
     * Giúp giữ lại stack trace của lỗi ban đầu để tiện cho việc debug.
     *
     * @param message Thông báo lỗi cho client
     * @param status  Mã trạng thái HTTP
     * @param cause   Ngoại lệ gốc đã gây ra lỗi này
     */
    public AppException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }
}
