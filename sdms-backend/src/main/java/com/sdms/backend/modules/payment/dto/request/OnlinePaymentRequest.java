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

    @NotNull(message = "ID hóa đơn là bắt buộc")
    private UUID billId;

    @NotNull(message = "Số tiền là bắt buộc")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Số tiền phải lớn hơn 0"
    )
    private BigDecimal amount;

    @NotNull(message = "Phương thức thanh toán là bắt buộc")
    private PaymentMethod paymentMethod;

    private String transactionCode;
}
