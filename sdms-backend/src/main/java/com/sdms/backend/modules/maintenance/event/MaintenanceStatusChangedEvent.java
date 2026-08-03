package com.sdms.backend.modules.maintenance.event;

import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceStatusChangedEvent {
    private UUID requestId;
    private UUID studentId;
    private MaintenanceStatus newStatus;
    private String description;
}
