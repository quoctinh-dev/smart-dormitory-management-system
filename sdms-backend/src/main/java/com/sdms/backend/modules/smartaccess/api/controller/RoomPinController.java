package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.smartaccess.application.service.RoomPinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@Tag(name = "Mã PIN phòng (Room PIN)", description = "API quản lý mã PIN cửa các phòng")
public class RoomPinController {

    private final RoomPinService roomPinService;

    /**
     * Lấy PIN hiện tại của 1 phòng.
     * GET /api/v1/room-pins/{roomId}
     */
    @Operation(summary = "Lấy mã PIN", description = "Lấy mã PIN hiện tại của một phòng cụ thể")
    @GetMapping("/{roomId}")
    public ApiResponse<Map<String, String>> getRoomPin(@PathVariable UUID roomId) {
        String pin = roomPinService.getPinForRoom(roomId);
        return ApiResponse.success("Lấy mã PIN phòng thành công", Map.of("roomId", roomId.toString(), "pin", pin));
    }

    /**
     * Reset PIN cho 1 phòng cụ thể.
     * POST /api/v1/room-pins/{roomId}/reset
     */
    @Operation(summary = "Reset mã PIN", description = "Tạo mã PIN mới ngẫu nhiên cho một phòng cụ thể")
    @PostMapping("/{roomId}/reset")
    public ApiResponse<Map<String, String>> resetRoomPin(@PathVariable UUID roomId) {
        String newPin = roomPinService.resetPinForRoom(roomId);
        log.info("[Admin] Reset PIN for roomId={}", roomId);
        return ApiResponse.success("Khôi phục mã PIN thành công", Map.of("roomId", roomId.toString(), "newPin", newPin));
    }

    /**
     * Sinh PIN hàng loạt cho tất cả phòng CHƯA có PIN.
     * POST /api/v1/room-pins/bulk-generate
     * Dùng khi: Khởi tạo hệ thống lần đầu, thêm nhiều phòng mới.
     */
    @Operation(summary = "Tạo PIN hàng loạt", description = "Tự động sinh mã PIN cho tất cả các phòng chưa có PIN")
    @PostMapping("/bulk-generate")
    public ApiResponse<Map<String, Integer>> bulkGeneratePins() {
        int count = roomPinService.generatePinsForAllRoomsWithoutPin();
        log.info("[Admin] Bulk generated PINs for {} rooms.", count);
        return ApiResponse.success(
            "Đã tạo PIN thành công cho " + count + " phòng.",
            Map.of("generatedCount", count)
        );
    }

    /**
     * Reset PIN hàng loạt cho TẤT CẢ phòng.
     * POST /api/v1/room-pins/bulk-reset
     * Dùng khi: Cần làm mới toàn bộ hệ thống bảo mật (sau sự cố, cuối kỳ...).
     */
    @Operation(summary = "Reset PIN toàn bộ hệ thống", description = "Làm mới mã PIN cho tất cả các phòng trong hệ thống")
    @PostMapping("/bulk-reset")
    public ApiResponse<Map<String, Integer>> bulkResetAllPins() {
        int count = roomPinService.resetPinsForAllRooms();
        log.info("[Admin] Bulk RESET all PINs for {} rooms.", count);
        return ApiResponse.success(
            "Đã làm mới mã PIN cho toàn bộ " + count + " phòng trong hệ thống.",
            Map.of("resetCount", count)
        );
    }
}
