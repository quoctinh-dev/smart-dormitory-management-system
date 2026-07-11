package com.sdms.backend.modules.student.dto;

import com.sdms.backend.modules.student.enums.ChangeRoomRequestStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChangeRoomResponseDto {
    private Long id;
    private String reason;
    private String currentRoomName;
    private String targetRoomName;
    private ChangeRoomRequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
