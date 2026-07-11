package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.smartaccess.application.service.RoomPinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * RoomPinController: API quản lý mã PIN cửa phòng.
 *
 * DESIGN PRINCIPLE:
 * - PIN thuộc về PHÒNG → sinh viên đổi phòng không cần làm gì thêm.
 * - Admin sinh PIN hàng loạt khi khởi tạo hệ thống.
 * - Admin reset PIN từng phòng hoặc hàng loạt khi cần.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/room-pins")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoomPinController {

    private final RoomPinService roomPinService;

    /**
     * Lấy PIN hiện tại của 1 phòng.
     * GET /api/v1/room-pins/{roomId}
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getRoomPin(@PathVariable UUID roomId) {
        String pin = roomPinService.getPinForRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success("Room PIN fetched", Map.of("roomId", roomId.toString(), "pin", pin)));
    }

    /**
     * Reset PIN cho 1 phòng cụ thể.
     * POST /api/v1/room-pins/{roomId}/reset
     */
    @PostMapping("/{roomId}/reset")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetRoomPin(@PathVariable UUID roomId) {
        String newPin = roomPinService.resetPinForRoom(roomId);
        log.info("[Admin] Reset PIN for roomId={}", roomId);
        return ResponseEntity.ok(ApiResponse.success("PIN reset successfully", Map.of("roomId", roomId.toString(), "newPin", newPin)));
    }

    /**
     * Sinh PIN hàng loạt cho tất cả phòng CHƯA có PIN.
     * POST /api/v1/room-pins/bulk-generate
     * Dùng khi: Khởi tạo hệ thống lần đầu, thêm nhiều phòng mới.
     */
    @PostMapping("/bulk-generate")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> bulkGeneratePins() {
        int count = roomPinService.generatePinsForAllRoomsWithoutPin();
        log.info("[Admin] Bulk generated PINs for {} rooms.", count);
        return ResponseEntity.ok(ApiResponse.success(
            "PIN generated for " + count + " rooms without PIN.",
            Map.of("generatedCount", count)
        ));
    }

    /**
     * Reset PIN hàng loạt cho TẤT CẢ phòng.
     * POST /api/v1/room-pins/bulk-reset
     * Dùng khi: Cần làm mới toàn bộ hệ thống bảo mật (sau sự cố, cuối kỳ...).
     */
    @PostMapping("/bulk-reset")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> bulkResetAllPins() {
        int count = roomPinService.resetPinsForAllRooms();
        log.info("[Admin] Bulk RESET all PINs for {} rooms.", count);
        return ResponseEntity.ok(ApiResponse.success(
            "All room PINs have been reset. Total: " + count + " rooms.",
            Map.of("resetCount", count)
        ));
    }
}
