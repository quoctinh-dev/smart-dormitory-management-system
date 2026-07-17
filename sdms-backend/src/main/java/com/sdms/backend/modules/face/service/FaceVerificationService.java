package com.sdms.backend.modules.face.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface cho xác thực danh tính thời gian thực.
 * Xử lý các yêu cầu thông lượng cao từ các cổng IoT.
 *
 * <p>Ownership: Face Module.
 * Quản lý sổ cái kiểm toán FaceVerificationAttempt.
 */
public interface FaceVerificationService {

    // DTO contracts are now defined in com.sdms.backend.modules.face.dto.response

    // --- LỆNH (COMMANDS) ---

    /**
     * Xác thực payload khuôn mặt đến với các vector đã duyệt.
     * Đánh giá khoảng cách dựa trên ngưỡng quản trị nội bộ.
     * @param verificationPayload Payload trừu tượng từ IoT Edge (ẩn chi tiết serialize vector)
     * @return FaceVerificationResultResponse chứa khoảng cách, ID lần thử, ID hồ sơ khớp, v.v.
     */
    com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, com.sdms.backend.modules.face.dto.request.FaceVerificationRequest verificationPayload);

    /**
     * Xác thực ảnh khuôn mặt đến trực tiếp từ một cổng IoT.
     * Ủy quyền trích xuất cho AiExtractionPort.
     */
    com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, org.springframework.web.multipart.MultipartFile faceImage);
    // --- TRUY VẤN (QUERIES) ---

    /**
     * Lấy sổ cái kiểm toán của các lần thử xác thực cho một hồ sơ sinh viên cụ thể.
     *
     * @param profileId The UUID of the FaceProfile
     * @param pageable Cấu hình phân trang
     * @return Các DTO tóm tắt phân trang (VerificationAttemptSummary)
     */
    Page<com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse> viewVerificationAttempts(UUID profileId, Pageable pageable);
}
