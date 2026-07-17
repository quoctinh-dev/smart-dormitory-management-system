package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.request.CreateBedRequest;
import com.sdms.backend.modules.room.dto.request.UpdateBedRequest;
import com.sdms.backend.modules.room.dto.response.BedResponse;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.service.BedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/beds")
@RequiredArgsConstructor
@Tag(name = "Quản lý giường (Bed Management)", description = "API quản lý cấu hình giường")
public class BedController {

    private final BedService bedService;

    @Operation(summary = "Tạo giường mới")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BedResponse> create(@Valid @RequestBody CreateBedRequest request) {
        return ApiResponse.success("Tạo giường thành công", bedService.createBed(request));
    }

    @Operation(summary = "Lấy danh sách giường theo phòng")
    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BedResponse>> getByRoom(@PathVariable UUID roomId) {
        return ApiResponse.success("Lấy danh sách giường thành công", bedService.getBedsByRoom(roomId));
    }

    @Operation(summary = "Tự động sinh giường cho phòng dựa trên sức chứa (Capacity)")
    @PostMapping("/room/{roomId}/auto-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BedResponse>> autoGenerateBeds(@PathVariable UUID roomId) {
        return ApiResponse.success("Sinh giường tự động thành công", bedService.autoGenerateBeds(roomId));
    }

    @Operation(summary = "Cập nhật trạng thái giường", description = "Chỉ được chuyển AVAILABLE <-> MAINTENANCE")
    @PatchMapping("/{bedId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> changeStatus(@PathVariable UUID bedId, @RequestParam BedStatus status) {
        bedService.changeStatus(bedId, status);
        return ApiResponse.success("Cập nhật trạng thái thành công");
    }
}