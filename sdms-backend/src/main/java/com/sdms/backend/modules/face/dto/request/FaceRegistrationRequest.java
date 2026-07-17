package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceRegistrationRequest(
    @NotBlank(message = "URL ảnh khuôn mặt là bắt buộc")
    @Size(max = 500, message = "URL quá dài")
    String faceImageUrl
) {}
