package com.sdms.backend.modules.application.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class ApplicationRejectedEvent extends ApplicationEvent {

    private final UUID applicationId;
    private final String email;
    private final String studentName;
    private final String reason;

    public ApplicationRejectedEvent(Object source, UUID applicationId, String email, String studentName, String reason) {
        super(source);
        this.applicationId = applicationId;
        this.email = email;
        this.studentName = studentName;
        this.reason = reason;
    }
}