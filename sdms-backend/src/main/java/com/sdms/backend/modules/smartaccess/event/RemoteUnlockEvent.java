package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class RemoteUnlockEvent {
    private final UUID gateId;
    private final UUID operatorId;

    // Consumed by AFTER_COMMIT listener
}
