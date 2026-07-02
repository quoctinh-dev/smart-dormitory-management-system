package com.sdms.backend.modules.student.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.student.dto.request.StayExtensionRequest;
import com.sdms.backend.modules.student.dto.response.StayExtensionResponse;
import com.sdms.backend.modules.student.service.StayExtensionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.student.dto.request.StayExtensionReviewRequest;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/students/extensions")
@RequiredArgsConstructor
public class StayExtensionController {

    private final StayExtensionService stayExtensionService;

    @PostMapping
    public ResponseEntity<ApiResponse<StayExtensionResponse>> submitExtension(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StayExtensionRequest request) {

        String studentCode = userDetails.getUsername(); // Username của User sinh viên là studentCode
        StayExtensionResponse response = stayExtensionService.submitExtension(studentCode, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Đã nộp đơn gia hạn lưu trú thành công", response)
        );
    }

    @GetMapping("/my-application")
    public ResponseEntity<ApiResponse<StayExtensionResponse>> getMyExtension(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String studentCode = userDetails.getUsername();
        StayExtensionResponse response = stayExtensionService.getMyExtension(studentCode);

        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin đơn gia hạn thành công", response)
        );
    }
}
