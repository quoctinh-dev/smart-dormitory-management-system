package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class EmergencyOverrideEvent {
    private final String actionType; // OPEN_ALL or LOCK_ALL
    private final UUID operatorId;
    private final String reason;
    private final UUID buildingId; // Nullable for Global

    // Consumed by AFTER_COMMIT listener
}
