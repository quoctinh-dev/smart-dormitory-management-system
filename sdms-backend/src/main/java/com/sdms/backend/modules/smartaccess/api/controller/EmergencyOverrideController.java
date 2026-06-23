package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.application.service.EmergencyOverrideService;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/emergency")
@RequiredArgsConstructor
public class EmergencyOverrideController {

    private final EmergencyOverrideService emergencyOverrideService;

    @PostMapping
    @PreAuthorize(SmartAccessPermissions.EMERGENCY_OVERRIDE)
    public ResponseEntity<Void> executeOverride(
            @RequestParam String actionType,
            @RequestParam String reason,
            @RequestParam(required = false) UUID buildingId,
            Principal principal) {
            
        // Validates explicit emergency payload and extracts operator dynamically
        UUID operatorId = UUID.fromString(principal.getName());
        emergencyOverrideService.executeEmergencyOverride(actionType, operatorId, reason, buildingId);
        return ResponseEntity.noContent().build();
    }
}
