package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.request.CreateFloorRequest;
import com.sdms.backend.modules.room.dto.request.UpdateFloorRequest;
import com.sdms.backend.modules.room.dto.response.FloorResponse;
import com.sdms.backend.modules.room.service.FloorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/floors")
@RequiredArgsConstructor
@Tag(name = "Quản lý tầng (Floor Management)", description = "API quản lý tầng cho tòa nhà")
public class FloorController {

    private final FloorService floorService;

    @Operation(summary = "Tạo tầng mới")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<FloorResponse> create(@Valid @RequestBody CreateFloorRequest request) {
        return ApiResponse.success("Tạo tầng thành công", floorService.createFloor(request));
    }

    @Operation(summary = "Lấy chi tiết tầng")
    @GetMapping("/{floorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<FloorResponse> getDetail(@PathVariable UUID floorId) {
        return ApiResponse.success("Lấy chi tiết tầng thành công", floorService.getFloor(floorId));
    }

    @Operation(summary = "Lấy danh sách tầng theo tòa nhà")
    @GetMapping("/building/{buildingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<FloorResponse>> getByBuilding(@PathVariable UUID buildingId) {
        return ApiResponse.success("Lấy danh sách tầng thành công", floorService.getFloorsByBuilding(buildingId));
    }

    @Operation(summary = "Cập nhật chính sách cư trú của tầng")
    @PutMapping("/{floorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<FloorResponse> update(@PathVariable UUID floorId, @Valid @RequestBody UpdateFloorRequest request) {
        return ApiResponse.success("Cập nhật tầng thành công", floorService.updateFloor(floorId, request));
    }
}