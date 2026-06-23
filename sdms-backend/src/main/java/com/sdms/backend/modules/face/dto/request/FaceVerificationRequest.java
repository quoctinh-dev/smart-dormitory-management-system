package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FaceVerificationRequest(
    @NotBlank(message = "Image vector is required")
    String queryVector
) {}
