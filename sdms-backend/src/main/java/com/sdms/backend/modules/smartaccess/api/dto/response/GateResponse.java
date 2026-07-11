package com.sdms.backend.modules.smartaccess.api.dto.response;

import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class GateResponse {
    private UUID gateId;
    private String name;
    private GateType gateType;
    private UUID buildingId;
    private String buildingName;
    private UUID roomId;
    private String roomCode;
    private String macAddress;
    private boolean active;
}
