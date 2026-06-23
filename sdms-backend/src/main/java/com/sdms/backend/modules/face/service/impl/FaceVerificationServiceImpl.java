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

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FaceVerificationServiceImpl implements FaceVerificationService {

    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceVerificationAttemptRepository attemptRepository;
    private final ApplicationEventPublisher eventPublisher;

    // AI Cosine Similarity Threshold (Governance constraint)
    // Distance = 1.0 - Similarity. Configurable via application.yml
    @org.springframework.beans.factory.annotation.Value("${sdms.face.verification.threshold:0.2}")
    private double matchDistanceThreshold;

    @Override
    public com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse verifyFace(String gateDeviceId, com.sdms.backend.modules.face.dto.request.FaceVerificationRequest verificationPayload) {
        
        // 1. Extract vector from DTO
        String queryVectorStr = verificationPayload.queryVector();

        // 2. Perform nearest neighbor search in DB (pgvector)
        Optional<FaceEmbeddingRepository.VectorMatchResult> matchOpt = faceEmbeddingRepository.findNearestMatch(queryVectorStr);

        if (matchOpt.isEmpty()) {
            return processFailedAttempt(gateDeviceId, null, FaceVerificationResult.FAIL, null);
        }

        FaceEmbeddingRepository.VectorMatchResult match = matchOpt.get();
        UUID profileId = match.getProfileId();
        Double distance = match.getDistance();

        // 3. Evaluate threshold locally in service
        boolean isMatch = distance <= matchDistanceThreshold;
        
        // Diagnostic confidence score (1.0 - distance)
        BigDecimal confidenceScore = BigDecimal.valueOf(Math.max(0.0, 1.0 - distance))
                .setScale(8, RoundingMode.HALF_UP);

        if (!isMatch) {
            // TODO (Security Audit): Confirm if we should persist the suspected target's profileId 
            // for forensics, or leave it null to prevent false identity linking.
            return processFailedAttempt(gateDeviceId, profileId, FaceVerificationResult.FAIL, confidenceScore);
        }

        // 4. Append-only persistence (Audit Ledger)
        FaceVerificationAttempt attempt = FaceVerificationAttempt.builder()
                .gateDeviceId(gateDeviceId)
                .profileId(profileId)
                .confidenceScore(confidenceScore)
                .status(FaceVerificationResult.SUCCESS)
                .build();

        attempt = attemptRepository.save(attempt);

        // 5. Publish Event (Authorization is delegated to Smart Access via this event)
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
        
        // No event is fired on FAIL, minimizing internal bus traffic.
        return new com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse(false, profileId, confidenceScore, attempt.getAttemptId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse> viewVerificationAttempts(UUID profileId, Pageable pageable) {
        return Page.empty(); // To be implemented in DTO Mapping phase
    }
}
