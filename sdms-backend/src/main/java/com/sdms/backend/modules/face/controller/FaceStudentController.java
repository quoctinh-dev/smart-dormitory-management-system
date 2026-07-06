package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceRegistrationRequest;
import com.sdms.backend.modules.face.dto.request.FaceReplacementRequest;
import com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse;
import com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse;
import com.sdms.backend.modules.face.service.FaceProfileService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import com.sdms.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students/me/face")
@RequiredArgsConstructor
public class FaceStudentController {

    private final FaceProfileService faceProfileService;
    private final FaceVerificationService faceVerificationService;
    private final CloudinaryService cloudinaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<UUID>> registerFace(
            @RequestHeader("X-Student-Id") UUID studentId,
            @RequestParam("file") MultipartFile file) {
        
        // 1. Upload ảnh lên Cloudinary
        String imageUrl = cloudinaryService.uploadFile(file, "sdms/faces");
        
        // 2. Tạo hồ sơ khuôn mặt (Trạng thái PENDING)
        UUID profileId = faceProfileService.registerFace(studentId, imageUrl);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Face registered successfully and pending approval", profileId));
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
