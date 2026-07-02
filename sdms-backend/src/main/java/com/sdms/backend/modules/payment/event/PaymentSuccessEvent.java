package com.sdms.backend.modules.payment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class PaymentSuccessEvent extends ApplicationEvent {
    private final UUID billId;
    private final UUID assignmentId;
    private final UUID applicationId;
    private final UUID studentId;
    private final String email;
    private final String studentName;
    private final BigDecimal amount;

    public PaymentSuccessEvent(Object source, UUID billId, UUID assignmentId, UUID applicationId, UUID studentId, String email, String studentName, BigDecimal amount) {
        super(source);
        this.billId = billId;
        this.assignmentId = assignmentId;
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.email = email;
        this.studentName = studentName;
        this.amount = amount;
    }
}
