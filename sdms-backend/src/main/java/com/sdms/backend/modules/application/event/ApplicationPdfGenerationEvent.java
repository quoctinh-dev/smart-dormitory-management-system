package com.sdms.backend.modules.application.event;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class ApplicationPdfGenerationEvent extends ApplicationEvent {
    private final UUID applicationId;

    public ApplicationPdfGenerationEvent(Object source, UUID applicationId) {
        super(source);
        this.applicationId = applicationId;
    }

    public UUID getApplicationId() {
        return applicationId;
    }
}
