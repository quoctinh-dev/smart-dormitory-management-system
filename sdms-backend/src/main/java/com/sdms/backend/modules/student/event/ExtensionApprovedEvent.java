package com.sdms.backend.modules.student.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ExtensionApprovedEvent extends ApplicationEvent {

    private final UUID extensionId;
    private final UUID studentId;
    private final UUID assignmentId;
    private final String studentFullName;
    private final String studentEmail;

    public ExtensionApprovedEvent(Object source, UUID extensionId, UUID studentId, UUID assignmentId, String studentFullName, String studentEmail) {
        super(source);
        this.extensionId = extensionId;
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.studentFullName = studentFullName;
        this.studentEmail = studentEmail;
    }
}
