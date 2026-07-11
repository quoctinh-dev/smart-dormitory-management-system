package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.dto.request.RecordUtilityRequest;
import com.sdms.backend.modules.payment.dto.response.RoomUtilityResponse;
import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.payment.service.UtilityUsageManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/utilities")
@RequiredArgsConstructor
public class UtilityUsageController {

    private final UtilityUsageManagementService utilityUsageManagementService;

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<RoomUtilityResponse>> getRoomsForRecording(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam UtilityType type,
            @RequestParam(required = false) UUID buildingId,
            @RequestParam(required = false) UUID floorId
    ) {
        return ApiResponse.success(utilityUsageManagementService.getRoomsForUtilityRecording(month, year, type, buildingId, floorId));
    }

    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> recordUtility(
            @RequestParam UtilityType type,
            @Valid @RequestBody RecordUtilityRequest request
    ) {
        utilityUsageManagementService.recordUtility(request, type);
        return ApiResponse.success(null);
    }
}
