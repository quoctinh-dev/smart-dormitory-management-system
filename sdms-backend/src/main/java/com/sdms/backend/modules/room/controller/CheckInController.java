// 📄 Đường dẫn: src/main/java/com/sdms/backend/modules/room/controller/CheckInController.java
package com.sdms.backend.modules.room.controller;

import com.sdms.backend.modules.room.dto.response.CheckInSearchResponse;
import com.sdms.backend.modules.room.service.CheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/check-in")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 🌟 Bổ sung để tránh lỗi chặn CORS khi Frontend gọi sang Backend
@PreAuthorize("hasRole('ADMIN')")
public class CheckInController {

    private final CheckInService checkInService;

    /**
     * API 1: Tra cứu thông tin sinh viên để đối chiếu trước khi nhận phòng
     * Frontend gọi qua: checkInApi.searchStudent(cccd)
     */
    @GetMapping("/search")
    public ResponseEntity<com.sdms.backend.common.response.ApiResponse<CheckInSearchResponse>> searchStudent(@RequestParam("cccd") String cccd) {
        return ResponseEntity.ok(com.sdms.backend.common.response.ApiResponse.success("Tìm thấy thông tin sinh viên", checkInService.searchStudentForCheckIn(cccd)));
    }

    /**
     * API 2: Xác nhận sinh viên đã nhận phòng và bàn giao chìa khóa
     * Frontend gọi qua: checkInApi.confirmCheckIn(assignmentId)
     */
    @PostMapping("/{assignmentId}")
    public ResponseEntity<com.sdms.backend.common.response.ApiResponse<Void>> confirmCheckIn(@PathVariable("assignmentId") UUID assignmentId) {
        checkInService.confirmCheckIn(assignmentId);
        return ResponseEntity.ok(com.sdms.backend.common.response.ApiResponse.success("Thủ tục nhận phòng hoàn tất thành công.", null));
    }
}