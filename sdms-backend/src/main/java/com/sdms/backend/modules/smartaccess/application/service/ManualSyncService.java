package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.entity.Gate;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.enums.GateDirection;
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.domain.repository.GateRepository;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ManualSyncService {

    private final AccessHistoryRepository accessHistoryRepository;
    private final GateRepository gateRepository;

    /**
     * Admin manually syncs a student's IN/OUT direction to correct tailgating issues.
     * Records a MANUAL_OVERRIDE history entry so the toggle logic stays correct.
     */
    @Transactional
    public void syncState(UUID studentId, GateDirection direction, UUID operatorId, String reason) {
        log.info("Manual sync: student={} -> direction={}, operator={}, reason={}",
                studentId, direction, operatorId, reason);

        // Find the first BUILDING_GATE (prefer over ROOM_DOOR) to attach history to.
        Gate defaultGate = gateRepository.findAll().stream()
                .filter(g -> g.getGateType() == GateType.BUILDING_GATE && g.getBuilding() != null)
                .findFirst()
                .orElseGet(() -> gateRepository.findAll().stream()
                        .filter(g -> g.getBuilding() != null)
                        .findFirst()
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                                "Không tìm thấy cổng phù hợp để ghi lịch sử đồng bộ")));

        UUID buildingId = defaultGate.getBuilding().getBuildingId();

        AccessHistory history = AccessHistory.builder()
                .studentId(studentId)
                .gateId(defaultGate.getGateId())
                .buildingId(buildingId)
                .operatorId(operatorId)
                .eventTimestamp(LocalDateTime.now())
                .decision(AccessDecision.GRANTED)
                .method(VerificationMethod.MANUAL_OVERRIDE)
                .direction(direction)
                .denialReason("MANUAL_SYNC: " + (reason != null ? reason : "Admin đồng bộ trạng thái"))
                .build();

        accessHistoryRepository.save(history);
        log.info("Manual sync saved: student={} is now marked as {}", studentId, direction);
    }
}
