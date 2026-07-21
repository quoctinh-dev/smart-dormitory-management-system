package com.sdms.backend.modules.smartaccess.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;
import com.sdms.backend.modules.smartaccess.domain.enums.GateDirection;

@Data
public class SyncStateRequestDto {
    @NotNull(message = "studentId is required")
    private UUID studentId;
    
    @NotNull(message = "direction is required")
    private GateDirection direction;
    
    private String reason;
}
