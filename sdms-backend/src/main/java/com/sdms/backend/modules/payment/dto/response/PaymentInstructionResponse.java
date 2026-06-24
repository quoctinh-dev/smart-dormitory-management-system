package com.sdms.backend.modules.payment.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInstructionResponse {
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String qrCodeUrl;
    private String contentPrefix; // Prefix for transfer content, e.g., "SDMS-"
}
