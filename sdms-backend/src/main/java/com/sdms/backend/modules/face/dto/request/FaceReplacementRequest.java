package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceReplacementRequest(
    @NotBlank(message = "New face image URL is required")
    @Size(max = 500, message = "URL is too long")
    String pendingFaceImageUrl
) {}
