package com.sdms.backend.modules.face.dto.response;

import com.sdms.backend.modules.face.enums.FaceProfileStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record FaceProfileDetailResponse(
    UUID profileId,
    UUID studentId,
    String faceImageUrl,
    FaceProfileStatus status,
    String rejectionReason,
    String pendingFaceImageUrl,
    LocalDateTime replacementRequestedAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
