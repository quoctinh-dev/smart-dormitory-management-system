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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/floors")
@RequiredArgsConstructor
@Tag(name = "Floor Management", description = "API quản lý tầng cho tòa nhà")
public class FloorController {

    private final FloorService floorService;

    @Operation(summary = "Tạo tầng mới")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> create(@Valid @RequestBody CreateFloorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Floor created successfully", floorService.createFloor(request)));
    }

    @Operation(summary = "Lấy chi tiết tầng")
    @GetMapping("/{floorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> getDetail(@PathVariable UUID floorId) {
        return ResponseEntity.ok(ApiResponse.success(floorService.getFloor(floorId)));
    }

    @Operation(summary = "Lấy danh sách tầng theo tòa nhà")
    @GetMapping("/building/{buildingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<FloorResponse>>> getByBuilding(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.success(floorService.getFloorsByBuilding(buildingId)));
    }

    @Operation(summary = "Cập nhật chính sách cư trú của tầng")
    @PutMapping("/{floorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FloorResponse>> update(@PathVariable UUID floorId, @Valid @RequestBody UpdateFloorRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Floor updated successfully", floorService.updateFloor(floorId, request)));
    }
}