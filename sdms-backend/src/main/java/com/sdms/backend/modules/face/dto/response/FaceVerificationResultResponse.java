package com.sdms.backend.modules.face.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO chứa kết quả trả về sau khi thực hiện xác thực khuôn mặt bằng AI.
 * Phục vụ cho việc cung cấp thông tin đối khớp sang các module khác (như Smart Access) để quyết định quyền ra vào.
 * 
 * @param isMatch Cờ đánh dấu khuôn mặt có khớp với dữ liệu trong hệ thống hay không (Đã vượt qua ngưỡng Threshold hay chưa).
 * @param matchedProfileId Khóa chính của hồ sơ khuôn mặt (FaceProfile) khớp nhất trong hệ thống. Null nếu không tìm thấy.
 * @param matchedStudentId Khóa chính của sinh viên (Student) sở hữu khuôn mặt này. Dùng để đối chiếu với thẻ RFID. Null nếu không tìm thấy.
 * @param confidenceScore Điểm số tin cậy của thuật toán AI (Giá trị từ 0.0 đến 1.0).
 * @param attemptId Khóa chính của bản ghi lưu trữ lịch sử quét khuôn mặt (FaceVerificationAttempt) dùng để kiểm toán.
 */
public record FaceVerificationResultResponse(
    boolean isMatch,
    UUID matchedProfileId,
    UUID matchedStudentId,
    BigDecimal confidenceScore,
    UUID attemptId
) {}
