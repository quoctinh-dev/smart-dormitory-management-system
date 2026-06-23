package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceRegistrationRequest;
import com.sdms.backend.modules.face.dto.request.FaceReplacementRequest;
import com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse;
import com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse;
import com.sdms.backend.modules.face.service.FaceProfileService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students/me/face")
@RequiredArgsConstructor
public class FaceStudentController {

    private final FaceProfileService faceProfileService;
    private final FaceVerificationService faceVerificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID registerFace(
            @RequestHeader("X-Student-Id") UUID studentId,
            @Valid @RequestBody FaceRegistrationRequest request) {
        return faceProfileService.registerFace(studentId, request.faceImageUrl());
    }

    @PostMapping("/replacements")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestReplacement(
            @RequestHeader("X-Student-Id") UUID studentId,
            @Valid @RequestBody FaceReplacementRequest request) {
        faceProfileService.requestReplacement(studentId, request.pendingFaceImageUrl());
    }

    @GetMapping
    public FaceProfileDetailResponse getMyProfile(
            @RequestHeader("X-Student-Id") UUID studentId) {
        return faceProfileService.getMyFaceProfile(studentId);
    }

    @GetMapping("/verifications")
    public Page<VerificationAttemptSummaryResponse> getMyVerifications(
            @RequestHeader("X-Student-Id") UUID studentId,
            Pageable pageable) {
        // Resolve profileId from studentId
        FaceProfileDetailResponse profile = faceProfileService.getMyFaceProfile(studentId);
        if (profile == null) {
            return Page.empty();
        }
        return faceVerificationService.viewVerificationAttempts(profile.profileId(), pageable);
    }
}
