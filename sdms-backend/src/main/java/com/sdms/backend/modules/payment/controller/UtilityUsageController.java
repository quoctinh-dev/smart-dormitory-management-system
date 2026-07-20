package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.dto.request.RecordUtilityRequest;
import com.sdms.backend.modules.payment.dto.response.RoomUtilityResponse;
import com.sdms.backend.modules.payment.entity.UtilityType;
import com.sdms.backend.modules.payment.service.UtilityUsageManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/utilities")
@RequiredArgsConstructor
@Tag(name = "Điện nước (Utility)", description = "Quản lý ghi điện nước")
public class UtilityUsageController {

    private final UtilityUsageManagementService utilityUsageManagementService;

    @Operation(summary = "Lấy danh sách phòng để ghi chỉ số điện nước")
    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<RoomUtilityResponse>> getRoomsForRecording(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam UtilityType type,
            @RequestParam(required = false) UUID buildingId,
            @RequestParam(required = false) UUID floorId
    ) {
        return ApiResponse.success("Lấy danh sách thành công", utilityUsageManagementService.getRoomsForUtilityRecording(month, year, type, buildingId, floorId));
    }

    @Operation(summary = "Lưu chỉ số điện nước")
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> recordUtility(
            @RequestParam UtilityType type,
            @Valid @RequestBody RecordUtilityRequest request
    ) {
        utilityUsageManagementService.recordUtility(request, type);
        return ApiResponse.success("Lưu chỉ số điện nước thành công");
    }

    @Operation(summary = "Hủy chốt chỉ số điện nước")
    @DeleteMapping("/record")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> cancelUtilityRecord(
            @RequestParam UUID roomId,
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam UtilityType type
    ) {
        utilityUsageManagementService.cancelUtilityRecord(roomId, month, year, type);
        return ApiResponse.success("Hủy chốt và xóa hóa đơn liên quan thành công");
    }
}
