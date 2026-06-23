package com.sdms.backend.modules.face.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record FaceVerificationResultResponse(
    boolean isMatch,
    UUID matchedProfileId,
    BigDecimal confidenceScore,
    UUID attemptId
) {}
