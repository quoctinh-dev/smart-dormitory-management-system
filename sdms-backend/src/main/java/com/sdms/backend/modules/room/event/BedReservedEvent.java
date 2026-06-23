package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class BedReservedEvent extends ApplicationEvent {
    private final UUID applicationId;
    private final UUID assignmentId;

    public BedReservedEvent(Object source, UUID applicationId, UUID assignmentId) {
        super(source);
        this.applicationId = applicationId;
        this.assignmentId = assignmentId;
    }
}
