package com.sdms.backend.modules.payment.service;

import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import org.springframework.stereotype.Service;

@Service
public class PaymentInstructionService {

    public PaymentInstructionResponse getPaymentInstructions() {
        // In a real application, this data would come from a database or configuration
        // For now, we'll hardcode it as per the requirement.
        return PaymentInstructionResponse.builder()
                .bankName("Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)")
                .accountNumber("0071000888888")
                .accountHolder("TRUNG TAM QUAN LY KTX STU")
                .qrCodeUrl("https://res.cloudinary.com/your-cloud-name/image/upload/v1/sdms/payment_qr_code.png") // Placeholder QR code URL
                .contentPrefix("SDMS-")
                .build();
    }
}
