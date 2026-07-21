// 📄 Đường dẫn: src/main/java/com/sdms/backend/modules/room/controller/CheckInController.java
package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.dto.response.CheckInSearchResponse;
import com.sdms.backend.modules.room.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/check-in")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 🌟 Bổ sung để tránh lỗi chặn CORS khi Frontend gọi sang Backend
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Thủ tục nhận phòng (Check-In)", description = "API quản lý thủ tục nhận phòng cho sinh viên")
public class CheckInController {

    private final CheckInService checkInService;

    /**
     * API 1: Tra cứu thông tin sinh viên để đối chiếu trước khi nhận phòng
     * Frontend gọi qua: checkInApi.searchStudent(cccd)
     */
    @Operation(summary = "Tra cứu sinh viên nhận phòng", description = "Tìm kiếm thông tin sinh viên bằng số CCCD/CMND")
    @GetMapping("/search")
    public ApiResponse<CheckInSearchResponse> searchStudent(@RequestParam("cccd") String cccd) {
        return ApiResponse.success("Tìm thấy thông tin sinh viên", checkInService.searchStudentForCheckIn(cccd));
    }

    /**
     * API 2: Xác nhận sinh viên đã nhận phòng và bàn giao chìa khóa
     * Frontend gọi qua: checkInApi.confirmCheckIn(assignmentId)
     */
    @Operation(summary = "Xác nhận nhận phòng", description = "Xác nhận sinh viên đã đến nhận phòng và bàn giao chìa khóa")
    @PostMapping("/{assignmentId}")
    public ApiResponse<Void> confirmCheckIn(@PathVariable("assignmentId") UUID assignmentId) {
        checkInService.confirmCheckIn(assignmentId);
        return ApiResponse.success("Thủ tục nhận phòng hoàn tất thành công.");
    }
}