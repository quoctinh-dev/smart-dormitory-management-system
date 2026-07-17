package com.sdms.backend.modules.payment.dto.response;

import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.enums.PaymentMethod;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PaymentResponse {

    private UUID paymentId;

    private UUID billId;

    private String transactionCode;

    private BigDecimal amount;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private BillStatus billStatus;

    private AssignmentStatus assignmentStatus;

    private BigDecimal paidAmount;

    private LocalDateTime paidAt;

    private String message;

    private String paymentUrl;
}
