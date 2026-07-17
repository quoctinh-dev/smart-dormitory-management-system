package com.sdms.backend.modules.face.enums;

/**
 * Kết quả của lần thử xác thực cổng IoT được xử lý bởi AI Engine.
 *
 * <p>Được lưu trữ trong {@link com.sdms.backend.modules.face.entity.FaceVerificationAttempt}
 * cho mục đích kiểm toán và chẩn đoán.
 */
public enum FaceVerificationResult {
    /** AI Engine khớp khung hình với sinh viên trên ngưỡng cosine similarity. */
    SUCCESS,

    /** AI Engine không tìm thấy khớp nào trên ngưỡng cosine similarity. */
    FAIL,

    /** AI Engine không thể truy cập hoặc hết hạn. Circuit breaker đã được kích hoạt. */
    AI_TIMEOUT
}
