package com.sdms.backend.modules.smartaccess.api.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class BulkCurfewRequestDto {
    @NotEmpty(message = "Danh sách ID không được để trống")
    private List<UUID> requestIds;
    
    private String adminNote;
}
