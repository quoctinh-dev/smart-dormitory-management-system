package com.sdms.backend.modules.student.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class StudentCreatedEvent extends ApplicationEvent {
    private final UUID studentId;
    private final UUID assignmentId;

    public StudentCreatedEvent(Object source, UUID studentId, UUID assignmentId) {
        super(source);
        this.studentId = studentId;
        this.assignmentId = assignmentId;
    }
}
