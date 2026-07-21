package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import com.sdms.backend.modules.face.service.FaceProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.application.service.RemoteUnlockService;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;
import com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse; // Import FaceProfileDetailResponse
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sdms.backend.modules.user.entity.UserAccount;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/access/gates/{gateId}/unlock")
@RequiredArgsConstructor
@Tag(name = "Mở khóa từ xa (Remote Unlock)", description = "API cho phép bảo vệ/quản lý mở khóa cổng từ xa qua hệ thống")
public class RemoteUnlockController {

    private final RemoteUnlockService remoteUnlockService;
    private final FaceProfileService faceProfileService;

    @Operation(summary = "Mở khóa cổng", description = "Gửi lệnh mở khóa tới một cổng cụ thể")
    @PostMapping
    @PreAuthorize(SmartAccessPermissions.REMOTE_UNLOCK)
    public ApiResponse<Void> unlockGate(
            @PathVariable UUID gateId, 
            @RequestParam UUID buildingId, 
            @RequestParam(required = false) UUID studentId,
            @AuthenticationPrincipal UserAccount userAccount) {
        UUID operatorId = userAccount.getAccountId();
        remoteUnlockService.executeRemoteUnlock(gateId, operatorId, buildingId, studentId);
        return ApiResponse.success("Đã gửi lệnh mở khóa thành công");
    }
}
