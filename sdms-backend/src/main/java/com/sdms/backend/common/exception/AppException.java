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
    private ErrorCode errorCode;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public AppException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.status = errorCode.getStatus();
        this.errorCode = errorCode;
    }
    
    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.status = errorCode.getStatus();
        this.errorCode = errorCode;
    }
}
