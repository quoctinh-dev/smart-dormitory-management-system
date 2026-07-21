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
import com.sdms.backend.modules.smartaccess.domain.enums.GateDirection;
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.CurfewRequestRepository;

import com.sdms.backend.modules.system.service.SystemConfigService;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalDate;
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
    private final CurfewRequestRepository curfewRequestRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final SystemConfigService systemConfigService;

    @Transactional
    public void evaluateAccess(String eventId, UUID studentId, UUID gateId, VerificationMethod method, String snapshotUrl) {
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
            recordAccess(studentId, gateId, GateType.BUILDING_GATE, null, now, AccessDecision.DENIED, "UNAUTHORIZED_OR_INACTIVE", method, snapshotUrl);
            return;
        }

        StudentEligibilitySnapshot snapshot = eligibilityOpt.get();
        boolean isAllowed;
        String denialReason = null;

        // Check Gate Configuration
        Optional<Gate> gateOpt = gateRepository.findById(gateId);
        if (gateOpt.isEmpty() || !gateOpt.get().isActive()) {
            log.warn("Access DENIED for student {}. Reason: UNREGISTERED_OR_INACTIVE_GATE ({})", studentId, gateId);
            recordAccess(studentId, gateId, GateType.BUILDING_GATE, snapshot.getBuildingId(), now, AccessDecision.DENIED, "UNREGISTERED_OR_INACTIVE_GATE", method, snapshotUrl);
            return;
        }
        Gate gate = gateOpt.get();

        // Structural Gate vs Room Door validation
        if (gate.getGateType() == GateType.ROOM_DOOR) {
            if (gate.getRoom() == null || !gate.getRoom().getRoomId().equals(snapshot.getRoomId())) {
                log.warn("Access DENIED for student {}. Reason: NOT_ASSIGNED_TO_ROOM", studentId);
                recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_ROOM", method, snapshotUrl);
                return;
            }
            // Room doors only verify authorization (room assignment). No curfew applies to room doors.
            isAllowed = true;
        } else {
            // Building Gate Validation
            if (gate.getBuilding() != null && !gate.getBuilding().getBuildingId().equals(snapshot.getBuildingId())) {
                log.warn("Access DENIED for student {}. Reason: NOT_ASSIGNED_TO_BUILDING (Gate Building: {}, Student Building: {})", 
                        studentId, gate.getBuilding().getBuildingId(), snapshot.getBuildingId());
                recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_BUILDING", method, snapshotUrl);
                return;
            }
            
            // Strategy selection for Building Gates (Curfew and Time Windows)
            if (snapshot.getResidentType() == ResidentType.BOARDING) {
                isAllowed = curfewResolutionStrategy.isAllowed(snapshot.getBuildingId(), currentTime);
                if (!isAllowed) {
                    // Xác định "Business Date" (Ngày làm việc) cho việc kiểm tra đơn.
                    // Nếu sinh viên về lúc 01:00 AM, thực chất là họ đang về trễ cho đêm hôm trước.
                    LocalDate businessDate = now.toLocalDate();
                    if (now.toLocalTime().isBefore(LocalTime.of(6, 0))) {
                        businessDate = businessDate.minusDays(1);
                    }
                    
                    LocalDateTime startOfDay = businessDate.atStartOfDay();
                    LocalDateTime endOfDay = businessDate.atTime(23, 59, 59, 999999999);
                    
                    if (curfewRequestRepository.hasApprovedRequestForDate(studentId, startOfDay, endOfDay)) {
                        // Kiểm tra Deadline về trễ (Mặc định 00:00 - Nửa đêm)
                        String deadlineStr = systemConfigService.getConfigValue("LATE_RETURN_DEADLINE", "00:00");
                        
                        if ("OFF".equalsIgnoreCase(deadlineStr)) {
                            isAllowed = true;
                        } else {
                            try {
                                LocalTime deadlineTime = LocalTime.parse(deadlineStr);
                                LocalDateTime deadlineDateTime = businessDate.atTime(deadlineTime);
                                // Nếu deadline là giờ sáng hôm sau (VD: 00:00, 01:00)
                                if (deadlineTime.isBefore(LocalTime.of(12, 0))) {
                                    deadlineDateTime = deadlineDateTime.plusDays(1);
                                }
                                
                                if (now.isBefore(deadlineDateTime) || now.isEqual(deadlineDateTime)) {
                                    isAllowed = true;
                                } else {
                                    denialReason = "LATE_DEADLINE_EXCEEDED"; // Quá hạn giờ về trễ, phải gọi ban quản lý
                                }
                            } catch (Exception e) {
                                isAllowed = true; // Fallback nếu parse lỗi
                            }
                        }
                    } else {
                        denialReason = "CURFEW_VIOLATION";
                    }
                }
            } else {
                isAllowed = timeWindowEvaluationStrategy.isAllowed(snapshot.getBuildingId(), snapshot.getResidentType(), currentTime);
                if (!isAllowed) denialReason = "OUTSIDE_TIME_WINDOW";
            }
        }

        // Execute DB write (Append Only Constraint)
        if (isAllowed) {
            log.info("Access GRANTED for student {} at gate {}. Publishing UNLOCK MQTT command.", studentId, gateId);
            recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.GRANTED, null, method, snapshotUrl);
            eventPublisher.publishEvent(new com.sdms.backend.modules.smartaccess.event.GateCommandEvent(gateId, "UNLOCK", "Access Granted"));
        } else {
            log.warn("Access DENIED for student {} at gate {}. Reason: {}", studentId, gateId, denialReason);
            recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, denialReason, method, snapshotUrl);
            // Optional: Publish a deny event if IoT needs to buzz or display an error
        }
    }

    @Transactional
    public AccessDecision evaluateAccessSync(UUID studentId, UUID gateId, VerificationMethod method) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();

        Optional<StudentEligibilitySnapshot> eligibilityOpt = eligibilityEvaluationService.evaluateEligibility(studentId);
        if (eligibilityOpt.isEmpty()) {
            recordAccess(studentId, gateId, GateType.BUILDING_GATE, null, now, AccessDecision.DENIED, "UNAUTHORIZED_OR_INACTIVE", method, null);
            return AccessDecision.DENIED;
        }

        StudentEligibilitySnapshot snapshot = eligibilityOpt.get();
        boolean isAllowed;
        String denialReason = null;

        // Check Gate Configuration
        Optional<Gate> gateOpt = gateRepository.findById(gateId);
        if (gateOpt.isEmpty() || !gateOpt.get().isActive()) {
            recordAccess(studentId, gateId, GateType.BUILDING_GATE, snapshot.getBuildingId(), now, AccessDecision.DENIED, "UNREGISTERED_OR_INACTIVE_GATE", method, null);
            return AccessDecision.DENIED;
        }
        Gate gate = gateOpt.get();

        // Structural Gate vs Room Door validation
        if (gate.getGateType() == GateType.ROOM_DOOR) {
            if (gate.getRoom() == null || !gate.getRoom().getRoomId().equals(snapshot.getRoomId())) {
                recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_ROOM", method, null);
                return AccessDecision.DENIED;
            }
            isAllowed = true;
        } else {
            // Building Gate Validation
            if (gate.getBuilding() != null && !gate.getBuilding().getBuildingId().equals(snapshot.getBuildingId())) {
                recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, "NOT_ASSIGNED_TO_BUILDING", method, null);
                return AccessDecision.DENIED;
            }
            
            if (snapshot.getResidentType() == ResidentType.BOARDING) {
                isAllowed = curfewResolutionStrategy.isAllowed(snapshot.getBuildingId(), currentTime);
                if (!isAllowed) {
                    LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
                    LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59, 59, 999999999);
                    if (curfewRequestRepository.hasApprovedRequestForDate(studentId, startOfDay, endOfDay)) {
                        isAllowed = true;
                    } else {
                        denialReason = "CURFEW_VIOLATION";
                    }
                }
            } else {
                isAllowed = timeWindowEvaluationStrategy.isAllowed(snapshot.getBuildingId(), snapshot.getResidentType(), currentTime);
                if (!isAllowed) denialReason = "OUTSIDE_TIME_WINDOW";
            }
        }

        if (isAllowed) {
            recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.GRANTED, null, method, null);
            return AccessDecision.GRANTED;
        } else {
            recordAccess(studentId, gateId, gate.getGateType(), snapshot.getBuildingId(), now, AccessDecision.DENIED, denialReason, method, null);
            return AccessDecision.DENIED;
        }
    }

    @Transactional
    public void logFailedAccess(UUID studentId, UUID gateId, VerificationMethod method, String snapshotUrl, String reason) {
        LocalDateTime now = LocalDateTime.now();
        Optional<StudentEligibilitySnapshot> eligibilityOpt = eligibilityEvaluationService.evaluateEligibility(studentId);
        UUID buildingId = eligibilityOpt.map(StudentEligibilitySnapshot::getBuildingId).orElse(null);
        GateType gateType = gateRepository.findById(gateId).map(Gate::getGateType).orElse(GateType.BUILDING_GATE);

        recordAccess(studentId, gateId, gateType, buildingId, now, AccessDecision.DENIED, reason, method, snapshotUrl);
    }


    private void recordAccess(UUID studentId, UUID gateId, GateType gateType, UUID buildingId, LocalDateTime eventTimestamp, AccessDecision decision, String reason, VerificationMethod method, String snapshotUrl) {
        UUID finalBuildingId = buildingId != null ? buildingId : UUID.fromString("00000000-0000-0000-0000-000000000000");
        
        // Determine Direction (Toggle state) ONLY for Building Gates
        GateDirection currentDirection = GateDirection.UNKNOWN;
        if (decision == AccessDecision.GRANTED && gateType != GateType.ROOM_DOOR) {
            String lastDirection = accessHistoryRepository.findLastDirectionForStudent(studentId);
            if ("IN".equals(lastDirection)) {
                currentDirection = GateDirection.OUT;
            } else {
                currentDirection = GateDirection.IN;
            }
        }

        AccessHistory history = AccessHistory.builder()
                .studentId(studentId)
                .gateId(gateId)
                .buildingId(finalBuildingId)
                .eventTimestamp(eventTimestamp)
                .decision(decision)
                .denialReason(reason)
                .method(method)
                .direction(currentDirection)
                .snapshotUrl(snapshotUrl)
                .build();

        accessHistoryRepository.save(history);
    }

    @Transactional
    public void processOfflineLogBatch(com.sdms.backend.modules.smartaccess.api.dto.request.OfflineLogBatchRequest request) {
        if (request.logs() == null || request.logs().isEmpty()) return;

        LocalDateTime serverNow = LocalDateTime.now();
        UUID gateId = UUID.fromString(request.gateId());
        
        GateType gateType = gateRepository.findById(gateId).map(Gate::getGateType).orElse(GateType.BUILDING_GATE);

        for (var logItem : request.logs()) {
            UUID studentId = null;
            UUID buildingId = null;
            ResidentType residentType = null;
            
            if ("MASTER_PIN".equals(logItem.uid())) {
                studentId = UUID.fromString("00000000-0000-0000-0000-000000000000"); // System / Unknown
            } else {
                Optional<StudentEligibilitySnapshot> eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByRfid(logItem.uid());
                if (eligibilityOpt.isEmpty()) continue;
                
                StudentEligibilitySnapshot snapshot = eligibilityOpt.get();
                studentId = snapshot.getStudentId();
                buildingId = snapshot.getBuildingId();
                residentType = snapshot.getResidentType();
            }
            
            // Tính toán thời gian thực tế xảy ra sự kiện
            long diffMillis = request.currentMillis() - logItem.timestamp();
            LocalDateTime eventTime = serverNow.minusNanos(diffMillis * 1000000);
            
            // Đọc trạng thái In/Out cuối cùng
            GateDirection currentDirection = GateDirection.UNKNOWN;
            if (gateType != GateType.ROOM_DOOR) {
                String lastDirection = accessHistoryRepository.findLastDirectionForStudent(studentId);
                if ("IN".equals(lastDirection)) {
                    currentDirection = GateDirection.OUT;
                } else {
                    currentDirection = GateDirection.IN;
                }
            }

            // --- HẬU KIỂM (AUDIT LATER) TRÊN THỜI GIAN THỰC TẾ ---
            String reason = "OFFLINE_SYNC";
            
            if ("MASTER_PIN".equals(logItem.uid())) {
                reason = "OFFLINE_MASTER_PIN_GRANT";
            } else if (gateType == GateType.BUILDING_GATE && residentType == ResidentType.BOARDING) {
                boolean isTimeAllowed = curfewResolutionStrategy.isAllowed(buildingId, eventTime.toLocalTime());
                if (!isTimeAllowed) {
                    LocalDateTime startOfDay = eventTime.toLocalDate().atStartOfDay();
                    LocalDateTime endOfDay = eventTime.toLocalDate().atTime(23, 59, 59, 999999999);
                    if (!curfewRequestRepository.hasApprovedRequestForDate(studentId, startOfDay, endOfDay)) {
                        reason = "OFFLINE_SYNC_VIOLATION"; // Phạt nguội: Quẹt offline lúc quá giờ giới nghiêm mà không có đơn!
                    }
                }
            }

            AccessHistory history = AccessHistory.builder()
                    .studentId(studentId)
                    .gateId(gateId)
                    .buildingId(buildingId != null ? buildingId : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                    .eventTimestamp(eventTime)
                    .decision(AccessDecision.GRANTED) // Mạch offline đã mở cửa rồi
                    .denialReason(reason) 
                    .method("MASTER_PIN".equals(logItem.uid()) ? VerificationMethod.PIN : VerificationMethod.RFID)
                    .direction(currentDirection)
                    .build();

            accessHistoryRepository.save(history);
        }
    }
}
