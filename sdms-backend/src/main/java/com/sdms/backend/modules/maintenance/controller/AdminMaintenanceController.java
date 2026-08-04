package com.sdms.backend.modules.maintenance.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.maintenance.dto.request.UpdateMaintenanceStatusRequest;
import com.sdms.backend.modules.maintenance.dto.response.MaintenanceResponse;
import com.sdms.backend.modules.maintenance.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/maintenance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Admin Maintenance", description = "API Ban quản lý xử lý yêu cầu sửa chữa")
public class AdminMaintenanceController {

    private final MaintenanceService maintenanceService;

    @Operation(summary = "Lấy toàn bộ danh sách yêu cầu sửa chữa (Có lọc)")
    @GetMapping
    public ApiResponse<PageResponse<MaintenanceResponse>> getAllRequests(
            @RequestParam(required = false) com.sdms.backend.modules.maintenance.enums.MaintenanceStatus status,
            @RequestParam(required = false) String roomId,
            Pageable pageable) {
        PageResponse<MaintenanceResponse> response = maintenanceService.getAllRequests(status, roomId, pageable);
        return ApiResponse.success("Lấy danh sách yêu cầu thành công", response);
    }

    @Operation(summary = "Cập nhật trạng thái xử lý (PENDING -> IN_PROGRESS -> DONE)")
    @PutMapping("/{id}/status")
    public ApiResponse<MaintenanceResponse> updateStatus(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateMaintenanceStatusRequest request) {
        MaintenanceResponse response = maintenanceService.updateStatus(id, request);
        return ApiResponse.success("Cập nhật trạng thái thành công", response);
    }
}
