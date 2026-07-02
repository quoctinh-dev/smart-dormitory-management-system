package com.sdms.backend.modules.payment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class ReservationPaymentExpiredEvent extends ApplicationEvent {
    private final UUID billId;
    private final UUID assignmentId;
    private final UUID applicationId;
    private final UUID bedId;
    private final UUID studentId;

    public ReservationPaymentExpiredEvent(Object source, UUID billId, UUID assignmentId, UUID applicationId, UUID bedId, UUID studentId) {
        super(source);
        this.billId = billId;
        this.assignmentId = assignmentId;
        this.applicationId = applicationId;
        this.bedId = bedId;
        this.studentId = studentId;
    }
}
