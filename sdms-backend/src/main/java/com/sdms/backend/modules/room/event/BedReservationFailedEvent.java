package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class BedReservationFailedEvent extends ApplicationEvent {
    private final UUID applicationId;

    public BedReservationFailedEvent(Object source, UUID applicationId) {
        super(source);
        this.applicationId = applicationId;
    }
}
