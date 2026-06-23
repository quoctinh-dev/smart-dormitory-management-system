package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceVerificationRequest;
import com.sdms.backend.modules.face.dto.response.FaceVerificationResultResponse;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/face-verifications")
@RequiredArgsConstructor
public class FaceInternalController {

    private final FaceVerificationService faceVerificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public FaceVerificationResultResponse verifyFace(
            @RequestHeader("X-Gate-Device-Id") String gateDeviceId,
            @Valid @RequestBody FaceVerificationRequest request) {
        return faceVerificationService.verifyFace(gateDeviceId, request);
    }
}
