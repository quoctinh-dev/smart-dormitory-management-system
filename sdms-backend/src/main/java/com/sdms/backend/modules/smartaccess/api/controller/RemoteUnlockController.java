package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import com.sdms.backend.modules.face.service.FaceProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.application.service.RemoteUnlockService;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;
import com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse; // Import FaceProfileDetailResponse
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sdms.backend.modules.user.entity.UserAccount;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/access/gates/{gateId}/unlock")
@RequiredArgsConstructor
public class RemoteUnlockController {

    private final RemoteUnlockService remoteUnlockService;
    private final FaceProfileService faceProfileService;

    @PostMapping
    @PreAuthorize(SmartAccessPermissions.REMOTE_UNLOCK)
    public ResponseEntity<Void> unlockGate(@PathVariable UUID gateId, @RequestParam UUID buildingId, @AuthenticationPrincipal UserAccount userAccount) {
        UUID operatorId = userAccount.getAccountId();
        remoteUnlockService.executeRemoteUnlock(gateId, operatorId, buildingId);
        return ResponseEntity.noContent().build();
    }
}
