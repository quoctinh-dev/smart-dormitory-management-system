package com.sdms.backend.modules.student.dto.request;

import com.sdms.backend.modules.student.enums.ExtensionReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StayExtensionRequest {
    
    @NotNull(message = "Lý do gia hạn không được để trống")
    private ExtensionReason reason;

    private String description;
}
