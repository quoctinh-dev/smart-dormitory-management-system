package com.sdms.backend.modules.application.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class ApplicationApprovedEvent extends ApplicationEvent {
    private final UUID applicationId;
    private final UUID studentId;
    private final String gender;
    private final int priorityScore;
    private final String studentName;
    private final String studentEmail;

    public ApplicationApprovedEvent(Object source, UUID applicationId, UUID studentId, String gender, int priorityScore, String studentName, String studentEmail) {
        super(source);
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.gender = gender;
        this.priorityScore = priorityScore;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
    }
}