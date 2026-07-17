package com.sdms.backend.modules.face.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

/**
 * Service interface để quản lý vòng đời của aggregate FaceProfile.
 */
public interface FaceProfileService {

    // DTO contracts are now defined in com.sdms.backend.modules.face.dto.response

    // --- LỆNH ĐĂNG KÝ BAN ĐẦU ---

    UUID registerFace(UUID studentId, String faceImageUrl);
    void approveFace(UUID profileId, UUID adminId);
    void rejectFace(UUID profileId, String rejectionReason);
    void revokeFace(UUID profileId, String revocationReason);

    // --- LỆNH QUẢN TRỊ THAY THẾ ---

    void requestReplacement(UUID studentId, String pendingFaceImageUrl);
    void approveReplacement(UUID profileId, UUID adminId);
    void rejectReplacement(UUID profileId, String rejectionReason);
    void finalizeReplacement(UUID profileId, float[] newVector);

    // --- TRUY VẤN (QUERIES) ---

    com.sdms.backend.modules.face.dto.response.FaceProfileDetailResponse getMyFaceProfile(UUID studentId);
    Page<com.sdms.backend.modules.face.dto.response.FaceProfileSummaryResponse> searchPendingProfiles(Pageable pageable);
}
