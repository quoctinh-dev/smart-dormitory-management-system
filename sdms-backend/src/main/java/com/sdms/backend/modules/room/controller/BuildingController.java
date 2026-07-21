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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/buildings")
@RequiredArgsConstructor
@Tag(name = "Quản lý tòa nhà (Building Management)", description = "API quản lý tòa nhà (Dành cho Admin)")
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "Tạo tòa nhà mới", description = "Dành cho Admin để thêm tòa nhà vào hệ thống.")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BuildingResponse> create(@Valid @RequestBody CreateBuildingRequest request) {
        BuildingResponse data = buildingService.createBuilding(request);
        return ApiResponse.success("Tạo tòa nhà thành công", data);
    }

    @Operation(summary = "Lấy danh sách tất cả tòa nhà")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<BuildingResponse>> getAll() {
        return ApiResponse.success("Lấy danh sách tòa nhà thành công", buildingService.getBuildings());
    }

    @Operation(summary = "Lấy chi tiết tòa nhà theo ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BuildingResponse> getDetail(@PathVariable UUID id) {
        return ApiResponse.success("Lấy chi tiết tòa nhà thành công", buildingService.getBuilding(id));
    }

    @Operation(summary = "Cập nhật thông tin tòa nhà", description = "Cho phép cập nhật tên và mô tả tòa nhà.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<BuildingResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateBuildingRequest request) {
        BuildingResponse data = buildingService.updateBuilding(id, request);
        return ApiResponse.success("Cập nhật tòa nhà thành công", data);
    }

    @Operation(summary = "Thay đổi trạng thái tòa nhà", description = "Chuyển đổi giữa các trạng thái: ACTIVE, MAINTENANCE, CLOSED.")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> changeStatus(@PathVariable UUID id, @RequestParam BuildingStatus status) {
        buildingService.changeStatus(id, status);
        return ApiResponse.success("Cập nhật trạng thái thành công");
    }
}