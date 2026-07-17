package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceRejectionRequest;
import com.sdms.backend.modules.face.dto.request.FaceRevocationRequest;
import com.sdms.backend.modules.face.dto.response.FaceProfileSummaryResponse;
import com.sdms.backend.modules.face.service.FaceProfileService;
import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/faces")
@RequiredArgsConstructor
@Tag(name = "Admin - Quản lý khuôn mặt", description = "Duyệt, từ chối, và thu hồi khuôn mặt")
public class FaceAdminController {

    private final FaceProfileService faceProfileService;

    @Operation(summary = "Duyệt hồ sơ khuôn mặt")
    @PostMapping("/{profileId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> approveFace(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable UUID profileId) {
        UUID adminId = currentUser.getAccountId();
        faceProfileService.approveFace(profileId, adminId);
        return ApiResponse.success("Đã duyệt khuôn mặt thành công");
    }

    @Operation(summary = "Từ chối hồ sơ khuôn mặt")
    @PostMapping("/{profileId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> rejectFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectFace(profileId, request.rejectionReason());
        return ApiResponse.success("Đã từ chối khuôn mặt thành công");
    }

    @Operation(summary = "Thu hồi hồ sơ khuôn mặt")
    @PostMapping("/{profileId}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> revokeFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRevocationRequest request) {
        faceProfileService.revokeFace(profileId, request.revocationReason());
        return ApiResponse.success("Đã thu hồi khuôn mặt thành công");
    }

    @Operation(summary = "Duyệt thay đổi khuôn mặt")
    @PostMapping("/{profileId}/replacements/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> approveReplacement(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable UUID profileId) {
        UUID adminId = currentUser.getAccountId();
        faceProfileService.approveReplacement(profileId, adminId);
        return ApiResponse.success("Đã duyệt thay đổi khuôn mặt thành công");
    }

    @Operation(summary = "Từ chối thay đổi khuôn mặt")
    @PostMapping("/{profileId}/replacements/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> rejectReplacement(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectReplacement(profileId, request.rejectionReason());
        return ApiResponse.success("Đã từ chối thay đổi khuôn mặt thành công");
    }

    @Operation(summary = "Lấy danh sách khuôn mặt chờ duyệt")
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<PageResponse<FaceProfileSummaryResponse>> searchPendingProfiles(Pageable pageable) {
        Page<FaceProfileSummaryResponse> page = faceProfileService.searchPendingProfiles(pageable);
        return ApiResponse.success("Lấy danh sách khuôn mặt chờ duyệt thành công", PageResponse.of(page));
    }
}
