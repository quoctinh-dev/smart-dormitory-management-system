package com.sdms.backend.modules.maintenance.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class RoomMaintenanceCompletedEvent extends ApplicationEvent {
    private final UUID ticketId;
    private final UUID roomId;
    private final UUID bedId;

    public RoomMaintenanceCompletedEvent(Object source, UUID ticketId, UUID roomId, UUID bedId) {
        super(source);
        this.ticketId = ticketId;
        this.roomId = roomId;
        this.bedId = bedId;
    }
}
