package com.sdms.backend.modules.face.dto.response;

import com.sdms.backend.modules.face.enums.FaceVerificationResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record VerificationAttemptSummaryResponse(
    UUID attemptId,
    String gateDeviceId,
    FaceVerificationResult status,
    BigDecimal confidenceScore,
    LocalDateTime attemptedAt
) {}
