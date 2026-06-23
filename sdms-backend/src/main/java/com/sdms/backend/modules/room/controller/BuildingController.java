package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.request.CreateBuildingRequest;
import com.sdms.backend.modules.room.dto.request.UpdateBuildingRequest;
import com.sdms.backend.modules.room.dto.response.BuildingResponse;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import com.sdms.backend.modules.room.service.BuildingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/buildings")
@RequiredArgsConstructor
@Tag(name = "Building Management", description = "API quản lý tòa nhà (Admin Only)")
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "Tạo tòa nhà mới", description = "Dành cho Admin để thêm tòa nhà vào hệ thống.")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BuildingResponse>> create(@Valid @RequestBody CreateBuildingRequest request) {
        BuildingResponse data = buildingService.createBuilding(request);
        return ResponseEntity.ok(ApiResponse.success("Building created successfully", data));
    }

    @Operation(summary = "Lấy danh sách tất cả tòa nhà")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuildings()));
    }

    @Operation(summary = "Lấy chi tiết tòa nhà theo ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BuildingResponse>> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(buildingService.getBuilding(id)));
    }

    @Operation(summary = "Cập nhật thông tin tòa nhà", description = "Cho phép cập nhật tên và mô tả tòa nhà.")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BuildingResponse>> update(@PathVariable UUID id, @Valid @RequestBody UpdateBuildingRequest request) {
        BuildingResponse data = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(ApiResponse.success("Building updated successfully", data));
    }

    @Operation(summary = "Thay đổi trạng thái tòa nhà", description = "Chuyển đổi giữa các trạng thái: ACTIVE, MAINTENANCE, CLOSED.")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changeStatus(@PathVariable UUID id, @RequestParam BuildingStatus status) {
        buildingService.changeStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully"));
    }
}