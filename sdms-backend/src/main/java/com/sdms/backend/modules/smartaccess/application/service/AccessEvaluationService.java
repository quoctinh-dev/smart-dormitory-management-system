package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentEligibilitySnapshot;
import com.sdms.backend.modules.smartaccess.application.strategy.CurfewResolutionStrategy;
import com.sdms.backend.modules.smartaccess.application.strategy.TimeWindowEvaluationStrategy;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccessEvaluationService {

    private final IdempotencyService idempotencyService;
    private final EligibilityEvaluationService eligibilityEvaluationService;
    private final CurfewResolutionStrategy curfewResolutionStrategy;
    private final TimeWindowEvaluationStrategy timeWindowEvaluationStrategy;
    private final AccessHistoryRepository accessHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void evaluateAccess(String eventId, UUID studentId, UUID gateId, VerificationMethod method) {
        // Idempotency execution immediately halts duplicate processing
        if (idempotencyService.isDuplicateOrRegister(eventId, "FACE_MODULE")) {
            log.info("Duplicate internal application event detected, dropping silently: {}", eventId);
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();

        // Facade delegation to Anti-Corruption Layer
        Optional<StudentEligibilitySnapshot> eligibilityOpt = eligibilityEvaluationService.evaluateEligibility(studentId);
        if (eligibilityOpt.isEmpty()) {
            recordAccess(studentId, gateId, null, now, AccessDecision.DENIED, "UNAUTHORIZED_OR_INACTIVE", method);
            return;
        }

        StudentEligibilitySnapshot snapshot = eligibilityOpt.get();
        boolean isAllowed;
        String denialReason = null;

        // Strategy selection
        if (snapshot.getResidentType() == ResidentType.BOARDING) {
            isAllowed = curfewResolutionStrategy.isAllowed(snapshot.getBuildingId(), currentTime);
            if (!isAllowed) denialReason = "CURFEW_VIOLATION";
        } else {
            isAllowed = timeWindowEvaluationStrategy.isAllowed(snapshot.getBuildingId(), snapshot.getResidentType(), currentTime);
            if (!isAllowed) denialReason = "OUTSIDE_TIME_WINDOW";
        }

        // Execute DB write (Append Only Constraint)
        if (isAllowed) {
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.GRANTED, null, method);
            // eventPublisher.publishEvent(...) will trigger IoT module via AFTER_COMMIT
        } else {
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, denialReason, method);
            // eventPublisher.publishEvent(...) will trigger IoT feedback
        }
    }

    @Transactional
    public AccessDecision evaluateAccessSync(UUID studentId, UUID gateId, VerificationMethod method) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();

        Optional<StudentEligibilitySnapshot> eligibilityOpt = eligibilityEvaluationService.evaluateEligibility(studentId);
        if (eligibilityOpt.isEmpty()) {
            recordAccess(studentId, gateId, null, now, AccessDecision.DENIED, "UNAUTHORIZED_OR_INACTIVE", method);
            return AccessDecision.DENIED;
        }

        StudentEligibilitySnapshot snapshot = eligibilityOpt.get();
        boolean isAllowed;
        String denialReason = null;

        if (snapshot.getResidentType() == ResidentType.BOARDING) {
            isAllowed = curfewResolutionStrategy.isAllowed(snapshot.getBuildingId(), currentTime);
            if (!isAllowed) denialReason = "CURFEW_VIOLATION";
        } else {
            isAllowed = timeWindowEvaluationStrategy.isAllowed(snapshot.getBuildingId(), snapshot.getResidentType(), currentTime);
            if (!isAllowed) denialReason = "OUTSIDE_TIME_WINDOW";
        }

        if (isAllowed) {
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.GRANTED, null, method);
            return AccessDecision.GRANTED;
        } else {
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, denialReason, method);
            return AccessDecision.DENIED;
        }
    }

    private void recordAccess(UUID studentId, UUID gateId, UUID buildingId, LocalDateTime eventTimestamp, AccessDecision decision, String reason, VerificationMethod method) {
        UUID finalBuildingId = buildingId != null ? buildingId : UUID.fromString("00000000-0000-0000-0000-000000000000");
        
        AccessHistory history = AccessHistory.builder()
                .studentId(studentId)
                .gateId(gateId)
                .buildingId(finalBuildingId)
                .eventTimestamp(eventTimestamp)
                .decision(decision)
                .denialReason(reason)
                .method(method)
                .build();

        accessHistoryRepository.save(history);
    }
}
