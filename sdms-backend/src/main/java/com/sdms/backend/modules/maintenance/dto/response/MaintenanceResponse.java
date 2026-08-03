package com.sdms.backend.modules.maintenance.dto.response;

import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MaintenanceResponse {
    private UUID id;
    private UUID roomId;
    private UUID studentId;
    private String description;
    private String imageUrl;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
