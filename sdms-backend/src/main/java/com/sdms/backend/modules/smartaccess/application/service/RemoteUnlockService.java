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

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RemoteUnlockService {

    private final AccessHistoryRepository accessHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void executeRemoteUnlock(UUID gateId, UUID operatorId, UUID buildingId) {
        log.info("Executing remote unlock for gate {} by operator {}", gateId, operatorId);

        // Bypass Scope: Time windows and Curfews are intentionally bypassed.
        // Security Boundaries: @PreAuthorize("hasAuthority('REMOTE_UNLOCK')") is enforced at Controller.
        
        AccessHistory history = AccessHistory.builder()
                .studentId(UUID.fromString("00000000-0000-0000-0000-000000000000")) 
                .gateId(gateId)
                .buildingId(buildingId)
                .operatorId(operatorId)
                .eventTimestamp(LocalDateTime.now())
                .decision(AccessDecision.GRANTED)
                .method(VerificationMethod.REMOTE_UNLOCK)
                .build();

        accessHistoryRepository.save(history);

        // Publish event to trigger IoT module (to be handled by an AFTER_COMMIT listener)
    }
}
