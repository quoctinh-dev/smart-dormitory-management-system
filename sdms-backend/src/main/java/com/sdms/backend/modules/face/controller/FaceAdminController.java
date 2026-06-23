package com.sdms.backend.modules.face.controller;

import com.sdms.backend.modules.face.dto.request.FaceRejectionRequest;
import com.sdms.backend.modules.face.dto.request.FaceRevocationRequest;
import com.sdms.backend.modules.face.dto.response.FaceProfileSummaryResponse;
import com.sdms.backend.modules.face.service.FaceProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/faces")
@RequiredArgsConstructor
public class FaceAdminController {

    private final FaceProfileService faceProfileService;

    @PostMapping("/{profileId}/approve")
    @ResponseStatus(HttpStatus.OK)
    public void approveFace(
            @RequestHeader("X-Admin-Id") UUID adminId,
            @PathVariable UUID profileId) {
        faceProfileService.approveFace(profileId, adminId);
    }

    @PostMapping("/{profileId}/reject")
    @ResponseStatus(HttpStatus.OK)
    public void rejectFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectFace(profileId, request.rejectionReason());
    }

    @PostMapping("/{profileId}/revoke")
    @ResponseStatus(HttpStatus.OK)
    public void revokeFace(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRevocationRequest request) {
        faceProfileService.revokeFace(profileId, request.revocationReason());
    }

    @PostMapping("/{profileId}/replacements/approve")
    @ResponseStatus(HttpStatus.OK)
    public void approveReplacement(
            @RequestHeader("X-Admin-Id") UUID adminId,
            @PathVariable UUID profileId) {
        faceProfileService.approveReplacement(profileId, adminId);
    }

    @PostMapping("/{profileId}/replacements/reject")
    @ResponseStatus(HttpStatus.OK)
    public void rejectReplacement(
            @PathVariable UUID profileId,
            @Valid @RequestBody FaceRejectionRequest request) {
        faceProfileService.rejectReplacement(profileId, request.rejectionReason());
    }

    @GetMapping("/pending")
    public Page<FaceProfileSummaryResponse> searchPendingProfiles(Pageable pageable) {
        return faceProfileService.searchPendingProfiles(pageable);
    }
}
