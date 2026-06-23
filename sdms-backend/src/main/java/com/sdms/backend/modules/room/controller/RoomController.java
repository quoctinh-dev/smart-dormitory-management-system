package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.request.CreateRoomRequest;
import com.sdms.backend.modules.room.dto.request.UpdateRoomRequest;
import com.sdms.backend.modules.room.dto.response.RoomResponse;
import com.sdms.backend.modules.room.enums.RoomStatus;
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
}