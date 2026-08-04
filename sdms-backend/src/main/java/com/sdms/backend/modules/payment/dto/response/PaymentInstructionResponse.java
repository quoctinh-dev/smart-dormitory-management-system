package com.sdms.backend.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInstructionResponse {
    private String bankName;
    private String bankAccount;
    private String accountHolder;
    private String qrCodeUrl;
    private String content;
    private java.math.BigDecimal amount;
}
