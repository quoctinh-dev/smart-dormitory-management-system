package com.sdms.backend.modules.application.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter // 🌟 Annotation này của Lombok sẽ tự sinh hàm event.getApplicationId() cho bạn
public class ApplicationRejectedEvent extends ApplicationEvent {

    private final UUID applicationId;

    public ApplicationRejectedEvent(Object source, UUID applicationId) {
        super(source);
        this.applicationId = applicationId;
    }
}