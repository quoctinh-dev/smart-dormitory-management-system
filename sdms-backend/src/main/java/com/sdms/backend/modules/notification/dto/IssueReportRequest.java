package com.sdms.backend.modules.notification.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class IssueReportRequest {
    @NotBlank
    private String description;
    @NotBlank
    private String roomId;
    private String imageUrl;
}
