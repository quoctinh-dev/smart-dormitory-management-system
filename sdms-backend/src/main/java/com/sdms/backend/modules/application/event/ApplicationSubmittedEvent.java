package com.sdms.backend.modules.application.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ApplicationSubmittedEvent extends ApplicationEvent {
    private final UUID applicationId;
    private final String gender;
    private final int priorityScore;

    public ApplicationSubmittedEvent(Object source, UUID applicationId, String gender, int priorityScore) {
        super(source);
        this.applicationId = applicationId;
        this.gender = gender;
        this.priorityScore = priorityScore;
    }
}
