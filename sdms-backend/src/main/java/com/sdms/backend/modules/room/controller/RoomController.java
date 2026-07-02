package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.request.CreateRoomRequest;
import com.sdms.backend.modules.room.dto.request.UpdateRoomRequest;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.common.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.sdms.backend.modules.room.dto.response.OccupancyAnalyticsResponse;
import com.sdms.backend.modules.room.dto.response.RevenueAtRiskResponse;
import com.sdms.backend.modules.room.dto.response.MaintenanceReportResponse;
import com.sdms.backend.modules.room.service.RoomService;
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
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "API quản lý phòng")
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "Tạo phòng mới")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> create(@Valid @RequestBody CreateRoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Room created successfully", roomService.createRoom(request)));
    }

    @Operation(summary = "Lấy chi tiết phòng")
    @GetMapping("/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> getDetail(@PathVariable UUID roomId) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoom(roomId)));
    }

    @Operation(summary = "Lấy danh sách phòng theo tầng")
    @GetMapping("/floor/{floorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getByFloor(@PathVariable UUID floorId) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomsByFloor(floorId)));
    }

    @Operation(summary = "Cập nhật thông tin phòng")
    @PutMapping("/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> update(@PathVariable UUID roomId, @Valid @RequestBody UpdateRoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", roomService.updateRoom(roomId, request)));
    }

    @Operation(summary = "Thay đổi trạng thái phòng")
    @PatchMapping("/{roomId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changeStatus(@PathVariable UUID roomId, @RequestParam RoomStatus status) {
        roomService.changeStatus(roomId, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully"));
    }

    @Operation(summary = "Tìm kiếm và lọc danh sách phòng")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<RoomResponse>>> searchRooms(
            @RequestParam(required = false) UUID buildingId,
            @RequestParam(required = false) UUID floorId,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(required = false) Gender policy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomCode") String sortBy
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(ApiResponse.success(
                roomService.searchRooms(buildingId, floorId, status, policy, pageable)
        ));
    }

    @Operation(summary = "Thống kê tỷ lệ lấp đầy phòng (Dashboard)")
    @GetMapping("/analytics/occupancy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OccupancyAnalyticsResponse>> getOccupancyAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getOccupancyAnalytics()));
    }

    @Operation(summary = "Gợi ý danh sách phòng trống để điều chuyển khẩn cấp")
    @GetMapping("/analytics/emergency-relocation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getEmergencyRelocationRooms() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getEmergencyRelocationRooms()));
    }

    @Operation(summary = "Thống kê rủi ro tài chính / Nợ cước (Dashboard)")
    @GetMapping("/analytics/revenue-at-risk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RevenueAtRiskResponse>> getRevenueAtRisk() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRevenueAtRisk()));
    }

    @Operation(summary = "Báo cáo bảo trì phòng (Dashboard)")
    @GetMapping("/analytics/maintenance-report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceReportResponse>> getMaintenanceReport() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getMaintenanceReport()));
    }
}