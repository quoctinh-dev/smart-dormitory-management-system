package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceRegistrationRequest(
    @NotBlank(message = "Face image URL is required")
    @Size(max = 500, message = "URL is too long")
    String faceImageUrl
) {}
