package com.sdms.backend.modules.room.controller;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/assignments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Hạn chót đóng tiền phòng (Countdown)", description = "API xem đếm ngược thời gian giữ chỗ của sinh viên")
public class StudentAssignmentCountdownController {
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final SystemConfigService systemConfigService;
    
    @Operation(summary = "Lấy đếm ngược thanh toán")
    @GetMapping("/countdown")
    @Cacheable(value = "assignmentCountdown", key = "#assignmentId")
    public ApiResponse<Map<String, Object>> getCountdown(@RequestParam UUID assignmentId) {
        StudentHousingAssignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null || assignment.getReservedAt() == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hợp đồng lưu trú hoặc thời gian đặt phòng.");
        }
        
        int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));
        LocalDateTime deadline = assignment.getReservedAt().plusDays(deadlineDays);
        Duration duration = Duration.between(LocalDateTime.now(), deadline);
        long hoursLeft = duration.toHours();
        
        Map<String, Object> response = new HashMap<>();
        response.put("deadline", deadline);
        response.put("hoursLeft", hoursLeft);
        if (hoursLeft <= 0) {
            response.put("status", "EXPIRED");
            response.put("message", "Quá hạn thanh toán giữ chỗ, hệ thống sẽ tự động hủy.");
        } else {
            response.put("status", "ACTIVE");
            response.put("message", "Vui lòng thanh toán trước hạn chót.");
        }
        
        return ApiResponse.success("Lấy đếm ngược thành công", response);
    }
}
