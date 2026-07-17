package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceRegistrationRequest;
import com.sdms.backend.modules.face.dto.request.FaceReplacementRequest;
import com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse;
import com.sdms.backend.modules.face.dto.response.VerificationAttemptSummaryResponse;
import com.sdms.backend.modules.face.service.FaceProfileService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students/me/face")
@RequiredArgsConstructor
@Tag(name = "Sinh viên - Hồ sơ khuôn mặt", description = "Đăng ký và quản lý hồ sơ khuôn mặt của sinh viên")
public class FaceStudentController {

    private final FaceProfileService faceProfileService;
    private final FaceVerificationService faceVerificationService;
    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Đăng ký khuôn mặt mới")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<UUID> registerFace(
            @AuthenticationPrincipal UserAccount currentUser,
            @RequestParam("file") MultipartFile file) {
        
        UUID studentId = currentUser.getStudent().getStudentId();
        // 1. Upload ảnh lên Cloudinary
        String imageUrl = cloudinaryService.uploadFile(file, "sdms/faces");
        
        // 2. Tạo hồ sơ khuôn mặt (Trạng thái PENDING)
        UUID profileId = faceProfileService.registerFace(studentId, imageUrl);
        
        return ApiResponse.success("Đăng ký khuôn mặt thành công và đang chờ duyệt", profileId);
    }

    @Operation(summary = "Yêu cầu thay thế khuôn mặt")
    @PostMapping(value = "/replacements", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Void> requestReplacement(
            @AuthenticationPrincipal UserAccount currentUser,
            @RequestParam("file") MultipartFile file) {
        
        UUID studentId = currentUser.getStudent().getStudentId();
        // Upload ảnh thay thế lên Cloudinary
        String imageUrl = cloudinaryService.uploadFile(file, "sdms/faces");
        
        // Gửi yêu cầu thay thế ảnh
        faceProfileService.requestReplacement(studentId, imageUrl);
        
        return ApiResponse.success("Yêu cầu thay thế khuôn mặt thành công");
    }

    @Operation(summary = "Lấy hồ sơ khuôn mặt của tôi")
    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<FaceProfileDetailResponse> getMyProfile(
            @AuthenticationPrincipal UserAccount currentUser) {
        UUID studentId = currentUser.getStudent().getStudentId();
        FaceProfileDetailResponse profile = faceProfileService.getMyFaceProfile(studentId);
        return ApiResponse.success("Lấy hồ sơ khuôn mặt thành công", profile);
    }

    @Operation(summary = "Lấy lịch sử xác thực khuôn mặt")
    @GetMapping("/verifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<PageResponse<VerificationAttemptSummaryResponse>> getMyVerifications(
            @AuthenticationPrincipal UserAccount currentUser,
            Pageable pageable) {
        UUID studentId = currentUser.getStudent().getStudentId();
        // Lấy profileId từ studentId
        FaceProfileDetailResponse profile = faceProfileService.getMyFaceProfile(studentId);
        if (profile == null) {
            return ApiResponse.success("Chưa có hồ sơ", PageResponse.of(Page.empty()));
        }
        Page<VerificationAttemptSummaryResponse> page = faceVerificationService.viewVerificationAttempts(profile.profileId(), pageable);
        return ApiResponse.success("Lấy lịch sử xác thực thành công", PageResponse.of(page));
    }
}
