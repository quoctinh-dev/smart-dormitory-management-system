package com.sdms.backend.modules.payment.service;

import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PaymentInstructionService {

    @Value("${payment.sepay.bank-account}")
    private String bankAccount;

    @Value("${payment.sepay.bank-code}")
    private String bankCode;

    @Value("${payment.sepay.bank-name}")
    private String bankName;

    @Value("${payment.sepay.account-holder}")
    private String accountHolder;

    public PaymentInstructionResponse getPaymentInstructions() {
        String qrCodeUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=0&des=SDMS",
                bankAccount, bankCode
        );

        return PaymentInstructionResponse.builder()
                .bankName(bankName)
                .accountNumber(bankAccount)
                .accountHolder(accountHolder)
                .qrCodeUrl(qrCodeUrl)
                .contentPrefix("SDMS")
                .build();
    }
}
