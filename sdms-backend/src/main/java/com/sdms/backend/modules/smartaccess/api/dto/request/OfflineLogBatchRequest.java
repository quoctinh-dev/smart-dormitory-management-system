package com.sdms.backend.modules.smartaccess.api.dto.request;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OfflineLogBatchRequest(
    @NotBlank(message = "gateId không được để trống")
    String gateId,
    
    @NotNull(message = "currentMillis không được để trống")
    Long currentMillis,
    
    List<OfflineLogItem> logs
) {
    public record OfflineLogItem(
        @NotBlank(message = "uid không được để trống")
        String uid,
        
        @NotNull(message = "timestamp không được để trống")
        Long timestamp,
        
        String action
    ) {}
}
