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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/faces")
@RequiredArgsConstructor
public class FaceAdminController {

    private final FaceProfileService faceProfileService;

    @PostMapping("/{profileId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> approveFace(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable UUID profileId) {
        UUID adminId = currentUser.getAccountId();
        faceProfileService.approveFace(profileId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Đã duyệt khuôn mặt thành công", null));
    }

    @PostMapping("/{profileId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> rejectFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectFace(profileId, request.rejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối khuôn mặt thành công", null));
    }

    @PostMapping("/{profileId}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> revokeFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRevocationRequest request) {
        faceProfileService.revokeFace(profileId, request.revocationReason());
        return ResponseEntity.ok(ApiResponse.success("Đã thu hồi khuôn mặt thành công", null));
    }

    @PostMapping("/{profileId}/replacements/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> approveReplacement(
            @AuthenticationPrincipal UserAccount currentUser,
            @PathVariable UUID profileId) {
        UUID adminId = currentUser.getAccountId();
        faceProfileService.approveReplacement(profileId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Đã duyệt thay đổi khuôn mặt thành công", null));
    }

    @PostMapping("/{profileId}/replacements/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> rejectReplacement(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectReplacement(profileId, request.rejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối thay đổi khuôn mặt thành công", null));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PageResponse<FaceProfileSummaryResponse>>> searchPendingProfiles(Pageable pageable) {
        Page<FaceProfileSummaryResponse> page = faceProfileService.searchPendingProfiles(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách khuôn mặt chờ duyệt thành công", PageResponse.of(page)));
    }
}
