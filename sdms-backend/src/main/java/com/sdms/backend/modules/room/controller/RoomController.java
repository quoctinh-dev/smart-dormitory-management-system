package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@Tag(name = "Quản lý phòng (Room Management)", description = "API quản lý phòng")
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "Tạo phòng mới")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<RoomResponse> create(@Valid @RequestBody CreateRoomRequest request) {
        return ApiResponse.success("Tạo phòng thành công", roomService.createRoom(request));
    }

    @Operation(summary = "Lấy chi tiết phòng")
    @GetMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<RoomResponse> getDetail(@PathVariable UUID roomId) {
        return ApiResponse.success("Lấy chi tiết phòng thành công", roomService.getRoom(roomId));
    }

    @Operation(summary = "Lấy danh sách phòng theo tầng")
    @GetMapping("/floor/{floorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<RoomResponse>> getByFloor(@PathVariable UUID floorId) {
        return ApiResponse.success("Lấy danh sách phòng thành công", roomService.getRoomsByFloor(floorId));
    }

    @Operation(summary = "Cập nhật thông tin phòng")
    @PutMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<RoomResponse> update(@PathVariable UUID roomId, @Valid @RequestBody UpdateRoomRequest request) {
        return ApiResponse.success("Cập nhật phòng thành công", roomService.updateRoom(roomId, request));
    }

    @Operation(summary = "Thay đổi trạng thái phòng")
    @PatchMapping("/{roomId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> changeStatus(@PathVariable UUID roomId, @RequestParam RoomStatus status) {
        roomService.changeStatus(roomId, status);
        return ApiResponse.success("Cập nhật trạng thái thành công");
    }

    @Operation(summary = "Gán chức vụ trong phòng cho sinh viên (Trưởng phòng/Phó phòng)")
    @PatchMapping("/assignments/{assignmentId}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> assignRoomRole(@PathVariable UUID assignmentId, @RequestParam com.sdms.backend.modules.room.enums.RoomRole role) {
        roomService.assignRoomRole(assignmentId, role);
        return ApiResponse.success("Cập nhật chức vụ thành công");
    }

    @Operation(summary = "Tìm kiếm và lọc danh sách phòng")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<PageResponse<RoomResponse>> searchRooms(
            @RequestParam(required = false) UUID buildingId,
            @RequestParam(required = false) UUID floorId,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(required = false) Gender policy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomCode") String sortBy
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<RoomResponse> roomPage = roomService.searchRooms(buildingId, floorId, status, policy, pageable);
        return ApiResponse.success("Tìm kiếm phòng thành công", PageResponse.of(roomPage));
    }

    @Operation(summary = "Thống kê tỷ lệ lấp đầy phòng (Dashboard)")
    @GetMapping("/analytics/occupancy")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<OccupancyAnalyticsResponse> getOccupancyAnalytics() {
        return ApiResponse.success("Lấy thống kê tỷ lệ lấp đầy thành công", roomService.getOccupancyAnalytics());
    }

    @Operation(summary = "Gợi ý danh sách phòng trống để điều chuyển khẩn cấp")
    @GetMapping("/analytics/emergency-relocation")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<RoomResponse>> getEmergencyRelocationRooms() {
        return ApiResponse.success("Lấy danh sách phòng gợi ý thành công", roomService.getEmergencyRelocationRooms());
    }

    @Operation(summary = "Thống kê rủi ro tài chính / Nợ cước (Dashboard)")
    @GetMapping("/analytics/revenue-at-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<RevenueAtRiskResponse> getRevenueAtRisk() {
        return ApiResponse.success("Lấy thống kê rủi ro tài chính thành công", roomService.getRevenueAtRisk());
    }

    @Operation(summary = "Báo cáo bảo trì phòng (Dashboard)")
    @GetMapping("/analytics/maintenance-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<MaintenanceReportResponse> getMaintenanceReport() {
        return ApiResponse.success("Lấy báo cáo bảo trì thành công", roomService.getMaintenanceReport());
    }

    @Operation(summary = "Xóa cứng phòng (Draft Only)", description = "Chỉ cho phép xóa phòng trống chưa từng có sinh viên ở.")
    @DeleteMapping("/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable UUID roomId) {
        roomService.deleteRoom(roomId);
        return ApiResponse.success("Xóa phòng thành công", null);
    }
}