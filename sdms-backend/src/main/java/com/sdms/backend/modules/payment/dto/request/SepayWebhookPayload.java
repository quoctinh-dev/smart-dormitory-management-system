package com.sdms.backend.modules.payment.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SepayWebhookPayload {
    private String id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private String code;
    private String content;
    private String transferType;
    private String description;
    private BigDecimal transferAmount;
    private BigDecimal accumulated;
    private String referenceCode;
}
