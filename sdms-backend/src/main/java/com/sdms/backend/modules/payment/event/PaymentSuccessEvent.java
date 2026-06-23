package com.sdms.backend.modules.payment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class PaymentSuccessEvent extends ApplicationEvent {
    private final UUID billId;
    private final UUID assignmentId;
    private final UUID applicationId;

    public PaymentSuccessEvent(Object source, UUID billId, UUID assignmentId, UUID applicationId) {
        super(source);
        this.billId = billId;
        this.assignmentId = assignmentId;
        this.applicationId = applicationId;
    }
}
