package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceVerificationRequest;
import com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import com.sdms.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/face-verifications")
@RequiredArgsConstructor
@Tag(name = "Nội bộ - Nhận diện khuôn mặt", description = "API dành cho thiết bị cổng xác thực khuôn mặt")
public class FaceInternalController {

    private final FaceVerificationService faceVerificationService;

    @Operation(summary = "Xác thực khuôn mặt từ thiết bị")
    @PostMapping
    public ApiResponse<FaceVerificationResultResponse> verifyFace(
            @RequestHeader("X-Gate-Device-Id") String gateDeviceId,
            @Valid @RequestBody FaceVerificationRequest request) {
        return ApiResponse.success("Xác thực khuôn mặt thành công", faceVerificationService.verifyFace(gateDeviceId, request));
    }
}
