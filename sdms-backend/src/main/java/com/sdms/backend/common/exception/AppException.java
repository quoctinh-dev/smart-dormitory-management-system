package com.sdms.backend.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Lớp ngoại lệ (Exception) cơ sở cho toàn bộ các lỗi nghiệp vụ (Business Error) trong hệ thống.
 * Kế thừa RuntimeException để hỗ trợ cơ chế ném ngoại lệ không bắt buộc (Unchecked Exception),
 * qua đó tối ưu hóa luồng xử lý và giảm thiểu mã nguồn thừa (boilerplate code).
 */
@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;
    private ErrorCode errorCode;



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
