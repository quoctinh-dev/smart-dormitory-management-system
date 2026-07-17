package com.sdms.backend.modules.face.service.impl;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceAiOrchestratorImpl implements FaceAiOrchestrator {

    private final FaceProfileRepository faceProfileRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceProfileService faceProfileService;
    private final AiExtractionPort aiExtractionPort;
    private final ApplicationEventPublisher eventPublisher;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFaceProfileApproved(FaceProfileApprovedEvent event) {
        log.info("Received FaceProfileApprovedEvent for profile: {}. Initiating async extraction.", event.profileId());
        generateEmbedding(event.profileId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFaceReplacementApproved(FaceReplacementApprovedEvent event) {
        log.info("Received FaceReplacementApprovedEvent for profile: {}. Initiating async replacement extraction.", event.profileId());
        generateReplacementEmbedding(event.profileId());
    }

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
