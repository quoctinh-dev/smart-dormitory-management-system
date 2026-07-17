package com.sdms.backend.modules.face.service.impl;

import com.sdms.backend.modules.face.entity.FaceVerificationAttempt;
import com.sdms.backend.modules.face.enums.FaceVerificationResult;
import com.sdms.backend.modules.face.event.FaceMatchSuccessEvent;
import com.sdms.backend.modules.face.repository.FaceEmbeddingRepository;
import com.sdms.backend.modules.face.repository.FaceVerificationAttemptRepository;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Dịch vụ cốt lõi xử lý nhận diện khuôn mặt sinh viên tại cổng KTX. So khớp vector đặc trưng (Face Embedding) gửi từ camera/IoT với cơ sở dữ liệu để xác minh danh tính.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Sử dụng Facade Pattern (gom nhóm logic query db, tính ngưỡng, publish event) và kiến trúc Event-Driven. Sử dụng pgvector trên PostgreSQL với chỉ mục HNSW.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích cho hội đồng tại sao dùng pgvector và HNSW: KTX có hàng ngàn sinh viên, so khớp tuần tự O(N) sẽ chậm. pgvector với HNSW (Hierarchical Navigable Small World) giúp tìm kiếm vector với độ phức tạp O(log N) cho kết quả dưới 100ms, đáp ứng yêu cầu realtime tại cổng rào. Distance dùng Cosine Similarity.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FaceVerificationServiceImpl implements FaceVerificationService {

    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceVerificationAttemptRepository attemptRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.sdms.backend.modules.face.port.AiExtractionPort aiExtractionPort;

    // Ngưỡng Cosine Similarity AI (Ràng buộc quản trị)
    // Khoảng cách = 1.0 - Độ tương đồng. Có thể cấu hình qua application.yml
    @org.springframework.beans.factory.annotation.Value("${sdms.face.verification.threshold:0.2}")
    private double matchDistanceThreshold;

    @Override
    public com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, org.springframework.web.multipart.MultipartFile faceImage) {
        log.info("[IoT] Extracting vector for gate {} using Python AI Sidecar...", gateDeviceId);
        float[] vector = aiExtractionPort.extractVector(faceImage);
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) sb.append(",");
        }
        sb.append("]");
        
        com.sdms.backend.modules.face.dto.request.FaceVerificationRequest payload = 
            new com.sdms.backend.modules.face.dto.request.FaceVerificationRequest(sb.toString());
            
        return verifyFace(gateDeviceId, payload);
    }

    @Override
    public com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, com.sdms.backend.modules.face.dto.request.FaceVerificationRequest verificationPayload) {
        
        // 1. Trích xuất vector (128 hoặc 512 chiều) từ payload của thiết bị IoT
        String queryVectorStr = verificationPayload.queryVector();

        // 2. Tìm kiếm vector lân cận gần nhất trong CSDL thông qua pgvector
        Optional<FaceEmbeddingRepository.VectorMatchResult> matchOpt = faceEmbeddingRepository.findNearestMatch(queryVectorStr);

        if (matchOpt.isEmpty()) {
            return processFailedAttempt(gateDeviceId, null, FaceVerificationResult.FAIL, null);
        }

        FaceEmbeddingRepository.VectorMatchResult match = matchOpt.get();
        UUID profileId = match.getProfileId();
        Double distance = match.getDistance();

        // 3. Đánh giá ngưỡng (Threshold) tại tầng Service
        boolean isMatch = distance <= matchDistanceThreshold;
        
        // Điểm tin cậy (Confidence Score: 1.0 - distance), làm tròn 8 chữ số thập phân
        BigDecimal confidenceScore = BigDecimal.valueOf(Math.max(0.0, 1.0 - distance))
                .setScale(8, RoundingMode.HALF_UP);

        if (!isMatch) {
            // Lưu vết thất bại phục vụ audit, giữ lại profileId bị nhận diện nhầm nếu có (pháp y)
            return processFailedAttempt(gateDeviceId, profileId, FaceVerificationResult.FAIL, confidenceScore);
        }

        // 4. Ghi nhận lịch sử (Append-only) làm bằng chứng không thể chối cãi
        FaceVerificationAttempt attempt = FaceVerificationAttempt.builder()
                .gateDeviceId(gateDeviceId)
                .profileId(profileId)
                .confidenceScore(confidenceScore)
                .status(FaceVerificationResult.SUCCESS)
                .build();

        attempt = attemptRepository.save(attempt);

        // 5. Phát sự kiện (Ủy quyền quyết định đóng/mở cổng cho module Smart Access thông qua event)
        eventPublisher.publishEvent(new FaceMatchSuccessEvent(gateDeviceId, profileId, attempt.getAttemptId()));

        return new com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse(true, profileId, confidenceScore, attempt.getAttemptId());
    }

    private com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse processFailedAttempt(String gateDeviceId, UUID profileId, FaceVerificationResult status, BigDecimal confidenceScore) {
        FaceVerificationAttempt attempt = FaceVerificationAttempt.builder()
                .gateDeviceId(gateDeviceId)
                .profileId(profileId)
                .confidenceScore(confidenceScore)
                .status(status)
                .build();

        attempt = attemptRepository.save(attempt);
        
        // Không phát sự kiện khi THẤT BẠI, giảm thiểu lưu lượng bus nội bộ.
        return new com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse(false, profileId, confidenceScore, attempt.getAttemptId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse> viewVerificationAttempts(UUID profileId, Pageable pageable) {
        return attemptRepository.findByProfileId(profileId, pageable)
                .map(attempt -> new com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse(
                        attempt.getAttemptId(),
                        attempt.getGateDeviceId(),
                        attempt.getStatus(),
                        attempt.getConfidenceScore(),
                        attempt.getAttemptedAt()
                ));
    }
}
