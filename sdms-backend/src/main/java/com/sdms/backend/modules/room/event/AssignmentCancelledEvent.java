package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class AssignmentCancelledEvent extends ApplicationEvent {
    private final UUID assignmentId;
    private final String reason;

    public AssignmentCancelledEvent(Object source, UUID assignmentId, String reason) {
        super(source);
        this.assignmentId = assignmentId;
        this.reason = reason;
    }
}
