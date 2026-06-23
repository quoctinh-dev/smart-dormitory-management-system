package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmergencyOverrideService {

    private final ApplicationEventPublisher eventPublisher;

    // Security Boundaries: @PreAuthorize("hasAuthority('EMERGENCY_OVERRIDE')") enforced at the Controller layer.
    public void executeEmergencyOverride(String actionType, UUID operatorId, String reason, UUID buildingId) {
        log.warn("Executing Emergency Override: ACTION={}, OPERATOR={}, REASON={}, BUILDING={}", 
            actionType, operatorId, reason, buildingId);

        // Publish global lockdown/unlock event to IoT module (to be handled by AFTER_COMMIT listener)
    }
}
