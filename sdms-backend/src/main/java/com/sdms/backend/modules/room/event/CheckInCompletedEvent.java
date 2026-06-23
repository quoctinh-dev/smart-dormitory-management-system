package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class CheckInCompletedEvent extends ApplicationEvent {
    private final UUID studentId;
    private final UUID assignmentId;

    public CheckInCompletedEvent(Object source, UUID studentId, UUID assignmentId) {
        super(source);
        this.studentId = studentId;
        this.assignmentId = assignmentId;
    }
}
