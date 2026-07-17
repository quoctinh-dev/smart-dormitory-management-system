package com.sdms.backend.modules.student.dto.response;

import com.sdms.backend.modules.student.enums.ExtensionReason;
import com.sdms.backend.modules.student.enums.ExtensionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class StayExtensionResponse {
    private UUID extensionId;
    private UUID studentId;
    private String studentCode;
    private String fullName;
    private ExtensionReason reason;
    private ExtensionStatus status;
    private UUID currentBedId;
    private String currentBedCode;
    private String currentRoomCode;
    private String contractPdfUrl;
    private String commitmentPdfUrl;
    private String description;
    private String rejectReason;
    private java.time.LocalDateTime oldExpectedCheckOutAt;
    private java.time.LocalDateTime newExpectedCheckOutAt;
}
