package com.sdms.backend.modules.smartaccess.event;

import lombok.Getter;

import java.util.UUID;

@Getter
public class SystemEmergencyEvent {
    private final String actionType; // e.g., "GLOBAL_LOCKDOWN", "GLOBAL_UNLOCK"
    private final String reason;
    private final UUID buildingId; // null means all buildings

    public SystemEmergencyEvent(String actionType, String reason, UUID buildingId) {
        this.actionType = actionType;
        this.reason = reason;
        this.buildingId = buildingId;
    }
}
