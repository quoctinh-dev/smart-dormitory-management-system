package com.sdms.backend.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ExpiringAssignmentDto {
    private UUID assignmentId;
    private String studentCode;
    private String studentName;
    private String buildingName;
    private String roomName;
    private String bedName;
    private LocalDate endDate;
}
