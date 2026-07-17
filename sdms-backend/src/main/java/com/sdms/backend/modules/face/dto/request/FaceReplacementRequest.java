package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceReplacementRequest(
    @NotBlank(message = "URL ảnh khuôn mặt mới là bắt buộc")
    @Size(max = 500, message = "URL quá dài")
    String pendingFaceImageUrl
) {}
