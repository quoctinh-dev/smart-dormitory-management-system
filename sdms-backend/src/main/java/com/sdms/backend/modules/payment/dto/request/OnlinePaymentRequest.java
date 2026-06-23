package com.sdms.backend.modules.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;
import com.sdms.backend.modules.payment.enums.PaymentMethod;

@Getter
@Setter
public class OnlinePaymentRequest {

    @NotNull(message = "Bill id is required")
    private UUID billId;

    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Amount must be greater than 0"
    )
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionCode;
}
