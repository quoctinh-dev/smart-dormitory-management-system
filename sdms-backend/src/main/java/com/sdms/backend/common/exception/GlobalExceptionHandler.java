package com.sdms.backend.common.exception;

import com.sdms.backend.common.exception.ErrorCode;

import com.sdms.backend.common.response.ApiResponse;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Bộ xử lý ngoại lệ trung tâm (Centralized Exception Handler) cho toàn bộ ứng dụng.
 * Chặn bắt mọi ngoại lệ phát sinh từ tầng Controller trở xuống, sau đó chuẩn hóa
 * và định dạng lại thành cấu trúc ApiResponse thống nhất trước khi gửi về client.
 * Ngăn chặn rò rỉ thông tin nhạy cảm (stacktrace) ra môi trường bên ngoài.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý lỗi nghiệp vụ tự định nghĩa (Business Logic Exceptions)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        log.warn("Business Error: {}", ex.getMessage());
        String errorCodeStr = ex.getErrorCode() != null ? ex.getErrorCode().name() : null;
        return ResponseEntity.status(ex.getStatus()).body(new ApiResponse<>(false, ex.getMessage(), null, errorCodeStr));
    }

    // 2. Xử lý lỗi xác thực dữ liệu đầu vào (Validation Error)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));

        log.warn("Validation Error: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, ErrorCode.VALIDATION_FAILED.getMessage(), errors, ErrorCode.VALIDATION_FAILED.name()));
    }

    // 3. Xử lý lỗi yêu cầu không hợp lệ (Bad Request, thiếu tham số, sai định dạng)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        log.warn("Bad Request Error (Not Readable): {}", ex.getMessage());
        String friendlyMessage = ErrorCode.BAD_REQUEST_FORMAT.getMessage();
        if (ex.getMessage() != null && ex.getMessage().contains("Cannot deserialize value of type")) {
            friendlyMessage = "Dữ liệu gửi lên không đúng định dạng. Ví dụ: Phương thức thanh toán hoặc trạng thái không được hỗ trợ.";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, friendlyMessage, null, ErrorCode.BAD_REQUEST_FORMAT.name()));
    }

    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ApiResponse<?>> handleBadRequest(Exception ex) {
        log.warn("Bad Request Error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, ErrorCode.BAD_REQUEST_FORMAT.getMessage(), null, ErrorCode.BAD_REQUEST_FORMAT.name()));
    }

    // 4. Xử lý lỗi xung đột dữ liệu từ Database (Data Integrity, Optimistic Lock)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database Integrity Error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(false, ErrorCode.DATA_CONFLICT.getMessage(), null, ErrorCode.DATA_CONFLICT.name()));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<?>> handleOptimisticLockingFailure(ObjectOptimisticLockingFailureException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, ErrorCode.OPTIMISTIC_LOCK_FAILURE.getMessage(), null, ErrorCode.OPTIMISTIC_LOCK_FAILURE.name()));
    }

    @ExceptionHandler(IncorrectResultSizeDataAccessException.class)
    public ResponseEntity<ApiResponse<?>> handleIncorrectResultSizeDataAccessException(IncorrectResultSizeDataAccessException ex) {
        log.error("Data Query Error - Non Unique Result: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(false, "Phát hiện dữ liệu trùng lặp (nhiều kết quả được trả về thay vì 1).", null, ErrorCode.DATA_CONFLICT.name()));
    }

    // 5. Xử lý lỗi bảo mật và phân quyền (Security & JWT Exceptions)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access Denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(false, ErrorCode.FORBIDDEN.getMessage(), null, ErrorCode.FORBIDDEN.name()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Auth Failed: Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, ErrorCode.INVALID_CREDENTIALS.getMessage(), null, ErrorCode.INVALID_CREDENTIALS.name()));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        log.warn("Auth Failed: User not found");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, ErrorCode.INVALID_CREDENTIALS.getMessage(), null, ErrorCode.INVALID_CREDENTIALS.name()));
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<?>> handleJwtException(JwtException ex) {
        log.warn("JWT Error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, ErrorCode.TOKEN_INVALID.getMessage(), null, ErrorCode.TOKEN_INVALID.name()));
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<?>> handleNotFoundException(Exception ex, WebRequest request) {
        log.warn("Not Found Error URI: {} - Error: {}", request.getDescription(false), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, "Tài nguyên hoặc đường dẫn không tồn tại (404 Not Found)", null, "NOT_FOUND"));
    }

    // 6. Xử lý lỗi hệ thống không xác định (Fallback Exception) - Tuyến phòng thủ cuối cùng
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex, WebRequest request) {
        log.error("Internal Server Error URI: {} - Error: ", request.getDescription(false), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, ErrorCode.INTERNAL_SERVER_ERROR.getMessage(), null, ErrorCode.INTERNAL_SERVER_ERROR.name()));
    }
}