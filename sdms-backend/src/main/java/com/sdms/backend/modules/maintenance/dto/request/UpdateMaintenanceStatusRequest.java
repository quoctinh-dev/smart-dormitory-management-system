package com.sdms.backend.modules.maintenance.dto.request;

import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMaintenanceStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private MaintenanceStatus status;
}
