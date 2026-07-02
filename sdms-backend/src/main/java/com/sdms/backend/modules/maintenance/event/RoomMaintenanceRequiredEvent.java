package com.sdms.backend.modules.maintenance.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class RoomMaintenanceRequiredEvent extends ApplicationEvent {
    private final UUID ticketId;
    private final UUID roomId;
    private final UUID bedId;
    private final String severity;
    private final String description;

    public RoomMaintenanceRequiredEvent(Object source, UUID ticketId, UUID roomId, UUID bedId, String severity, String description) {
        super(source);
        this.ticketId = ticketId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.severity = severity;
        this.description = description;
    }
}
