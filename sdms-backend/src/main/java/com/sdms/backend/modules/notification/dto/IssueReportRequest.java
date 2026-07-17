package com.sdms.backend.modules.notification.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class IssueReportRequest {
    @NotBlank(message = "Mô tả sự cố là bắt buộc")
    private String description;
    @NotBlank(message = "ID phòng là bắt buộc")
    private String roomId;
    private String imageUrl;
}
