package com.sdms.backend.modules.face.dto.response;

import com.sdms.backend.modules.face.enums.FaceProfileStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record FaceProfileSummaryResponse(
    UUID profileId,
    UUID studentId,
    String faceImageUrl,
    FaceProfileStatus status,
    LocalDateTime createdAt
) {}
