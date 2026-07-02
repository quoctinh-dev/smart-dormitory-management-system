package com.sdms.backend.modules.student.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class StudentCheckedOutEvent extends ApplicationEvent {

    private final UUID studentId;
    private final UUID assignmentId;
    private final String studentCode;

    public StudentCheckedOutEvent(Object source, UUID studentId, UUID assignmentId, String studentCode) {
        super(source);
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.studentCode = studentCode;
    }
}
