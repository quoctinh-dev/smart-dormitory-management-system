package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class CheckInCompletedEvent extends ApplicationEvent {
    private final UUID assignmentId;
    private final UUID applicationId;

    public CheckInCompletedEvent(Object source, UUID assignmentId, UUID applicationId) {
        super(source);
        this.assignmentId = assignmentId;
        this.applicationId = applicationId;
    }
}
