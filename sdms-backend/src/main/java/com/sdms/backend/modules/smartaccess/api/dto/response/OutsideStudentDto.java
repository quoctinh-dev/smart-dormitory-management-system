package com.sdms.backend.modules.smartaccess.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutsideStudentDto {
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private String roomCode;
    private String buildingName;
    private java.time.LocalDateTime lastOutTime;
}