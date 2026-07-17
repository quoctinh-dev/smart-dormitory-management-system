package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.sdms.backend.modules.smartaccess.application.service.EmergencyOverrideService;
import com.sdms.backend.modules.smartaccess.security.SmartAccessPermissions;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sdms.backend.modules.user.entity.UserAccount;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/access/emergency")
@RequiredArgsConstructor
@Tag(name = "Ghi đè khẩn cấp (Emergency Override)", description = "API thực thi lệnh khẩn cấp (Mở toàn bộ cổng/Khóa toàn bộ cổng)")
public class EmergencyOverrideController {

    private final EmergencyOverrideService emergencyOverrideService;

    @Operation(summary = "Thực thi ghi đè khẩn cấp", description = "Kích hoạt lệnh khẩn cấp lên toàn bộ cổng hoặc tòa nhà cụ thể")
    @PostMapping
    @PreAuthorize(SmartAccessPermissions.EMERGENCY_OVERRIDE)
    public ApiResponse<Void> executeOverride(
            @RequestParam String actionType,
            @RequestParam String reason,
            @RequestParam(required = false) UUID buildingId,
            @AuthenticationPrincipal UserAccount userAccount) {
            
        // Validates explicit emergency payload and extracts operator dynamically
        UUID operatorId = userAccount.getAccountId();
        emergencyOverrideService.executeEmergencyOverride(actionType, operatorId, reason, buildingId);
        return ApiResponse.success("Thực thi lệnh khẩn cấp thành công");
    }
}
