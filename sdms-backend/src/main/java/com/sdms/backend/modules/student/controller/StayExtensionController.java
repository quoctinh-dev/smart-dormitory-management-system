package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.StayExtensionRequest;
import com.sdms.backend.modules.student.dto.response.StayExtensionResponse;
import com.sdms.backend.modules.student.service.StayExtensionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/v1/students/extensions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student Stay Extension", description = "API quản lý đơn xin gia hạn lưu trú (dành cho Sinh viên)")
public class StayExtensionController {

    private final StayExtensionService stayExtensionService;

    @Operation(summary = "Nộp đơn gia hạn lưu trú", description = "Sinh viên nộp đơn xin gia hạn thêm thời gian ở ký túc xá")
    @PostMapping
    public ApiResponse<StayExtensionResponse> submitExtension(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StayExtensionRequest request) {

        String studentCode = userDetails.getUsername(); // Username của User sinh viên là studentCode
        StayExtensionResponse response = stayExtensionService.submitExtension(studentCode, request);

        return ApiResponse.success("Đã nộp đơn gia hạn lưu trú thành công", response);
    }

    @Operation(summary = "Lấy thông tin đơn gia hạn", description = "Sinh viên xem lại trạng thái đơn xin gia hạn lưu trú của mình")
    @GetMapping("/my-application")
    public ApiResponse<StayExtensionResponse> getMyExtension(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String studentCode = userDetails.getUsername();
        StayExtensionResponse response = stayExtensionService.getMyExtension(studentCode);

        return ApiResponse.success("Lấy thông tin đơn gia hạn thành công", response);
    }
}
