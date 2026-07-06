package com.sdms.backend.modules.smartaccess.event;

import lombok.Getter;

import java.util.UUID;

@Getter
public class GateCommandEvent {
    private final UUID gateId;
    private final String command; // e.g., "UNLOCK", "LOCK_DOWN"
    private final String reason;

    public GateCommandEvent(UUID gateId, String command, String reason) {
        this.gateId = gateId;
        this.command = command;
        this.reason = reason;
    }
}
