package com.sdms.backend.modules.face.service.impl;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.sdms.backend.modules.face.entity.FaceEmbedding;
import com.sdms.backend.modules.face.entity.FaceProfile;
import com.sdms.backend.modules.face.event.FaceProfileApprovedEvent;
import com.sdms.backend.modules.face.event.FaceReplacementApprovedEvent;
import com.sdms.backend.modules.face.event.FaceSyncReadyEvent;
import com.sdms.backend.modules.face.port.AiExtractionPort;
import com.sdms.backend.modules.face.repository.FaceEmbeddingRepository;
import com.sdms.backend.modules.face.repository.FaceProfileRepository;
import com.sdms.backend.modules.face.service.FaceAiOrchestrator;
import com.sdms.backend.modules.face.service.FaceProfileService;

import java.util.UUID;

/**
 * Service điều phối quy trình trích xuất vector khuôn mặt (AI Extraction Orchestrator).
 * <p>
 * Lắng nghe các sự kiện phê duyệt hồ sơ khuôn mặt để xử lý bất đồng bộ (@Async):
 * 1. Đăng ký mới: Trích xuất vector AI từ ảnh gốc và phát sự kiện đồng bộ thiết bị IoT.
 * 2. Thay đổi khuôn mặt: Trích xuất vector từ ảnh mới và thực hiện tráo đổi nguyên tử (Atomic Swap).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FaceAiOrchestratorImpl implements FaceAiOrchestrator {

    private final FaceProfileRepository faceProfileRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceProfileService faceProfileService;
    private final AiExtractionPort aiExtractionPort;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Lắng nghe sự kiện phê duyệt hồ sơ khuôn mặt lần đầu (FaceProfileApprovedEvent).
     * Chạy bất đồng bộ sau khi giao dịch duyệt hồ sơ hoàn tất (AFTER_COMMIT).
     *
     * @param event Sự kiện chứa thông tin profileId vừa duyệt
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFaceProfileApproved(FaceProfileApprovedEvent event) {
        log.info("Received FaceProfileApprovedEvent for profile: {}. Initiating async extraction.", event.profileId());
        generateEmbedding(event.profileId());
    }

    /**
     * Lắng nghe sự kiện phê duyệt yêu cầu thay đổi/cập nhật khuôn mặt (FaceReplacementApprovedEvent).
     * Chạy bất đồng bộ sau khi giao dịch duyệt cập nhật hoàn tất (AFTER_COMMIT).
     *
     * @param event Sự kiện chứa thông tin profileId yêu cầu thay đổi
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFaceReplacementApproved(FaceReplacementApprovedEvent event) {
        log.info("Received FaceReplacementApprovedEvent for profile: {}. Initiating async replacement extraction.", event.profileId());
        generateReplacementEmbedding(event.profileId());
    }

    /**
     * Trích xuất vector đặc trưng khuôn mặt cho hồ sơ đăng ký mới và lưu vào cơ sở dữ liệu.
     *
     * @param profileId Mã ID hồ sơ khuôn mặt
     */
    @Override
    @Transactional
    public void generateEmbedding(UUID profileId) {
        try {
            FaceProfile profile = faceProfileRepository.findById(profileId).orElseThrow();

            // Trích xuất vector sử dụng URL ảnh chính
            float[] vector = aiExtractionPort.extractVector(profile.getFaceImageUrl());

            FaceEmbedding embedding = FaceEmbedding.builder()
                    .profileId(profileId)
                    .embeddingVector(vector)
                    .build();

            faceEmbeddingRepository.save(embedding);

            log.info("Successfully generated and persisted embedding for profile: {}", profileId);

            // CHỈ phát sự kiện sau khi vector đã được lưu hoàn toàn
            eventPublisher.publishEvent(new FaceSyncReadyEvent(profileId));

        } catch (Exception e) {
            log.error("AI Extraction failed for initial registration of profile: {}", profileId, e);
            // Hệ thống giữ hồ sơ ở trạng thái ĐÃ DUYỆT.
            // Quản trị viên hoặc cron job có thể thử lại quá trình này sau.
        }
    }

    /**
     * Trích xuất vector đặc trưng từ ảnh mới và thực hiện tráo đổi nguyên tử (Atomic Swap) với vector cũ.
     *
     * @param profileId Mã ID hồ sơ khuôn mặt cần cập nhật
     */
    @Override
    public void generateReplacementEmbedding(UUID profileId) {
        try {
            FaceProfile profile = faceProfileRepository.findById(profileId).orElseThrow();

            if (profile.getPendingFaceImageUrl() == null) {
                log.warn("No pending image found for replacement on profile: {}", profileId);
                return;
            }

            // Trích xuất vector sử dụng URL ảnh đang chờ duyệt
            float[] newVector = aiExtractionPort.extractVector(profile.getPendingFaceImageUrl());

            // Atomic Swap đảm bảo không gián đoạn truy cập (Ủy quyền cho Domain Service)
            faceProfileService.finalizeReplacement(profileId, newVector);

            log.info("Successfully swapped embedding for replacement on profile: {}", profileId);

            // FaceSyncReadyEvent tự động được phát bên trong finalizeReplacement()
            // sau khi atomic swap hoàn tất.

        } catch (Exception e) {
            log.error("AI Extraction failed for replacement on profile: {}. Active face is NOT revoked.", profileId, e);
            // Lỗi AI không bao giờ được phép thu hồi khuôn mặt đang hoạt động.
            // Vector cũ vẫn hoạt động bình thường vì finalizeReplacement chưa từng được gọi.
        }
    }
}