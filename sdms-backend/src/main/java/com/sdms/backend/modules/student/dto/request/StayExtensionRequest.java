package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StayExtensionRequest {
    
    @NotBlank(message = "Lý do gia hạn không được để trống")
    private String reason;

    private String description;
}
