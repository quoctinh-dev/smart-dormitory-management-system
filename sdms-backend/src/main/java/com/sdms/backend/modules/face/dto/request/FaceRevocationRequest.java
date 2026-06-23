package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceRevocationRequest(
    @NotBlank(message = "Revocation reason is required")
    @Size(max = 255, message = "Reason is too long")
    String revocationReason
) {}
