package com.sdms.backend.modules.application.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminRequestRevisionRequest {
    private String note;
    
    @Min(value = 1, message = "Thời hạn phải lớn hơn hoặc bằng 1 ngày")
    private int deadlineDays = 3; // Default 3 days
}
