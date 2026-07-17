package com.sdms.backend.modules.face.service;

import java.util.UUID;

/**
 * DỊCH VỤ ĐIỀU PHỐI NỘI BỘ.
 * 
 * <p>Dịch vụ này hoạt động như một lớp Anti-Corruption Layer (ACL) giữa Module Face 
 * và AI Engine bên ngoài.
 *
 * <p><b>Điều hướng Sự kiện:</b> Đây KHÔNG phải là một application service công khai. Nó KHÔNG 
 * được gọi trực tiếp bởi các REST controller tiêu chuẩn. Nó chỉ được gọi qua 
 * các listener Spring Application Event phản ứng với {@code FaceProfileApprovedEvent}.
 *
 * <p>Quyền sở hữu: Module Face. Quản lý aggregate FaceEmbedding.
 */
public interface FaceAiOrchestrator {

    // --- LỆNH (COMMANDS) ---

    /**
     * Tạo một vector sinh trắc học cho hồ sơ khuôn mặt ĐÃ DUYỆT.
     * Tiêu thụ FaceProfileApprovedEvent nội bộ.
     * Phát FaceSyncReadyEvent AFTER_COMMIT khi lưu vector thành công.
     *
     * @param profileId UUID của FaceProfile cần xử lý
     */
    void generateEmbedding(UUID profileId);

    /**
     * Tạo một vector sinh trắc học cho yêu cầu thay thế đang chờ duyệt.
     * Tiêu thụ FaceReplacementApprovedEvent nội bộ.
     * Ủy quyền cho FaceProfileService.finalizeReplacement cho việc atomic swap.
     *
     * @param profileId UUID của FaceProfile cần xử lý
     */
    void generateReplacementEmbedding(UUID profileId);
}
