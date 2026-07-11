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
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;

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
    private final GateRepository gateRepository;
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

        // Check Gate Configuration
        Optional<Gate> gateOpt = gateRepository.findById(gateId);
        if (gateOpt.isEmpty() || !gateOpt.get().isActive()) {
            log.warn("Access DENIED for student {}. Reason: UNREGISTERED_OR_INACTIVE_GATE ({})", studentId, gateId);
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "UNREGISTERED_OR_INACTIVE_GATE", method);
            return;
        }
        Gate gate = gateOpt.get();

        // Structural Gate vs Room Door validation
        if (gate.getGateType() == GateType.ROOM_DOOR) {
            if (gate.getRoom() == null || !gate.getRoom().getRoomId().equals(snapshot.getRoomId())) {
                log.warn("Access DENIED for student {}. Reason: NOT_ASSIGNED_TO_ROOM", studentId);
                recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_ROOM", method);
                return;
            }
        } else {
            // Building Gate Validation
            if (gate.getBuilding() != null && !gate.getBuilding().getBuildingId().equals(snapshot.getBuildingId())) {
                log.warn("Access DENIED for student {}. Reason: NOT_ASSIGNED_TO_BUILDING (Gate Building: {}, Student Building: {})", 
                        studentId, gate.getBuilding().getBuildingId(), snapshot.getBuildingId());
                recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_BUILDING", method);
                return;
            }
        }

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
            log.info("Access GRANTED for student {} at gate {}. Publishing UNLOCK MQTT command.", studentId, gateId);
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.GRANTED, null, method);
            eventPublisher.publishEvent(new com.sdms.backend.modules.smartaccess.event.GateCommandEvent(gateId, "UNLOCK", "Access Granted"));
        } else {
            log.warn("Access DENIED for student {} at gate {}. Reason: {}", studentId, gateId, denialReason);
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, denialReason, method);
            // Optional: Publish a deny event if IoT needs to buzz or display an error
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

        // Check Gate Configuration
        Optional<Gate> gateOpt = gateRepository.findById(gateId);
        if (gateOpt.isEmpty() || !gateOpt.get().isActive()) {
            recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "UNREGISTERED_OR_INACTIVE_GATE", method);
            return AccessDecision.DENIED;
        }
        Gate gate = gateOpt.get();

        // Structural Gate vs Room Door validation
        if (gate.getGateType() == GateType.ROOM_DOOR) {
            if (gate.getRoom() == null || !gate.getRoom().getRoomId().equals(snapshot.getRoomId())) {
                recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_ROOM", method);
                return AccessDecision.DENIED;
            }
        } else {
            // Building Gate Validation
            if (gate.getBuilding() != null && !gate.getBuilding().getBuildingId().equals(snapshot.getBuildingId())) {
                recordAccess(studentId, gateId, snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_BUILDING", method);
                return AccessDecision.DENIED;
            }
        }

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
