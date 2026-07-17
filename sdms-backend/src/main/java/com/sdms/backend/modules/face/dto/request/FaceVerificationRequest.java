package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FaceVerificationRequest(
    @NotBlank(message = "Vector ảnh là bắt buộc")
    String queryVector
) {}
