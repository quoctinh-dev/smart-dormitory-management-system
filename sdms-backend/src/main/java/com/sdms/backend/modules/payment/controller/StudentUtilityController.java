package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.dto.response.StudentUtilityResponse;
import com.sdms.backend.modules.payment.service.StudentUtilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student/utilities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student Utility", description = "API cho sinh viên xem điện nước phòng mình")
public class StudentUtilityController {

    private final StudentUtilityService studentUtilityService;

    @Operation(summary = "Xem lịch sử chỉ số điện nước của phòng hiện tại", 
            description = "Lấy lịch sử chốt điện nước của phòng mà sinh viên đang cư trú (mới nhất xếp lên đầu). Bao gồm chỉ số đầu kỳ chốt lúc check-in.")
    @GetMapping("/my-room")
    public ApiResponse<List<StudentUtilityResponse>> getMyRoomUtilities() {
        return ApiResponse.success("Lấy thông tin điện nước thành công", studentUtilityService.getMyRoomUtilities());
    }
}
