package com.sdms.backend.modules.smartaccess.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CurfewRequestDto {
    private UUID requestId;
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private String reason;
    private String requestType;
    private LocalDateTime startDate;
    private LocalDateTime expectedArrivalTime;
    private String status;
    private LocalDateTime createdAt;
    private String adminNote;
}
