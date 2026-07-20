package com.sdms.backend.modules.notification.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
public class IssueReportRequest {
    @NotBlank(message = "Mô tả sự cố là bắt buộc")
    private String description;
    
    private boolean isCommonArea; // True nếu báo hỏng ở hành lang, sảnh...
    
    private UUID roomId;
}
