package com.sdms.backend.modules.maintenance.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMaintenanceRequest {
    @NotBlank(message = "Mô tả sự cố không được để trống")
    private String description;
    private String imageUrl;
}
