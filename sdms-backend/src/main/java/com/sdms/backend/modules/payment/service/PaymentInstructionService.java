package com.sdms.backend.modules.payment.service;

import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import org.springframework.stereotype.Service;

@Service
public class PaymentInstructionService {

    public PaymentInstructionResponse getPaymentInstructions() {
        return PaymentInstructionResponse.builder()
                .bankName("Ngân hàng TMCP Quân đội (MBBank)")
                .accountNumber("0819281512")
                .accountHolder("TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN")
                .qrCodeUrl(null)
                .contentPrefix("SDMS")
                .build();
    }
}
