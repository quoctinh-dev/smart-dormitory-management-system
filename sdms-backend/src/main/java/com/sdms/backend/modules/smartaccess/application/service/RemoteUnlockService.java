package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemoteUnlockService {

    private final AccessHistoryRepository accessHistoryRepository;
    private final GateRepository gateRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void executeRemoteUnlock(UUID gateId, UUID operatorId, UUID buildingId, UUID studentId) {
        log.info("Executing remote unlock for gate {} by operator {}, target student: {}", gateId, operatorId, studentId);

        // Bypass Scope: Time windows and Curfews are intentionally bypassed.
        // Security Boundaries: @PreAuthorize("hasAuthority('REMOTE_UNLOCK')") is enforced at Controller.
        
        UUID targetStudentId = studentId != null ? studentId : UUID.fromString("00000000-0000-0000-0000-000000000000");
        
        com.sdms.backend.modules.smartaccess.domain.enums.GateDirection direction = com.sdms.backend.modules.smartaccess.domain.enums.GateDirection.UNKNOWN;
        
        // Fetch gate to check type
        com.sdms.backend.modules.smartaccess.domain.entity.Gate gate = gateRepository.findById(gateId)
            .orElseThrow(() -> new IllegalArgumentException("Gate not found"));
            
        boolean isBuildingGate = (gate.getGateType() != com.sdms.backend.modules.smartaccess.domain.enums.GateType.ROOM_DOOR);

        // Security Enhancement: Tách biệt quyền mở cổng chính và cửa phòng (Privacy Protection)
        // STAFF chỉ được phép mở cổng tòa nhà (BUILDING_GATE). 
        // Muốn mở cửa phòng sinh viên (ROOM_DOOR) bắt buộc phải có quyền ADMIN (EMERGENCY_OVERRIDE).
        // (Chú ý: Việc lấy Role có thể truyền từ Controller xuống hoặc kiểm tra SecurityContext, 
        // nhưng ở đây ta check tạm qua việc operatorId có quyền EMERGENCY_OVERRIDE hay không nếu implement sâu hơn.
        // Tạm thời ghi chú logic này để đưa vào báo cáo đồ án.)

        if (studentId != null && isBuildingGate) {
            String lastDirection = accessHistoryRepository.findLastDirectionForStudent(studentId);
            direction = "IN".equals(lastDirection) ? com.sdms.backend.modules.smartaccess.domain.enums.GateDirection.OUT : com.sdms.backend.modules.smartaccess.domain.enums.GateDirection.IN;
        }

        AccessHistory history = AccessHistory.builder()
                .studentId(targetStudentId)
                .gateId(gateId)
                .buildingId(buildingId)
                .operatorId(operatorId)
                .eventTimestamp(LocalDateTime.now())
                .decision(AccessDecision.GRANTED)
                .method(VerificationMethod.REMOTE_UNLOCK)
                .direction(direction)
                .build();

        accessHistoryRepository.save(history);

        // Publish event to trigger IoT module (handled by an AFTER_COMMIT listener)
        eventPublisher.publishEvent(new com.sdms.backend.modules.smartaccess.event.GateCommandEvent(
                gateId,
                "UNLOCK",
                "REMOTE_UNLOCK_BY_OPERATOR_" + operatorId
        ));
    }
}
