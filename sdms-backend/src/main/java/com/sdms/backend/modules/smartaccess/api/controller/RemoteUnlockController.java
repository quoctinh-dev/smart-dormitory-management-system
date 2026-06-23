package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.application.service.RemoteUnlockService;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/access/gates/{gateId}/unlock")
@RequiredArgsConstructor
public class RemoteUnlockController {

    private final RemoteUnlockService remoteUnlockService;

    @PostMapping
    @PreAuthorize(SmartAccessPermissions.REMOTE_UNLOCK)
    public ResponseEntity<Void> unlockGate(@PathVariable UUID gateId, @RequestParam UUID buildingId, Principal principal) {
        // Extract operatorId from Spring Security context
        UUID operatorId = UUID.fromString(principal.getName());
        remoteUnlockService.executeRemoteUnlock(gateId, operatorId, buildingId);
        return ResponseEntity.noContent().build();
    }
}
