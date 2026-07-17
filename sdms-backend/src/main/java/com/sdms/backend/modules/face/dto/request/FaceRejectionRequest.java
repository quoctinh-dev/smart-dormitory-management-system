package com.sdms.backend.modules.face.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FaceRejectionRequest(
    @NotBlank(message = "Lý do từ chối là bắt buộc")
    @Size(max = 255, message = "Lý do quá dài")
    String rejectionReason
) {}
