package com.sdms.backend.modules.smartaccess.api.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.enums.GateDirection;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

@Data
@Builder
public class AccessHistoryDto {
    private UUID id;
    private UUID studentId;
    private String studentCode;
    private String studentName;
    private UUID gateId;
    private String gateName;
    private UUID buildingId;
    private LocalDateTime eventTimestamp;
    private AccessDecision decision;
    private String denialReason;
    private VerificationMethod method;
    private GateDirection direction;
    private String snapshotUrl;
}
