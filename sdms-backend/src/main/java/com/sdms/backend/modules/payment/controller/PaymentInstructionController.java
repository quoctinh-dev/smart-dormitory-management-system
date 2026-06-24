package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import com.sdms.backend.modules.payment.service.PaymentInstructionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/public/payment-instructions")
@RequiredArgsConstructor
public class PaymentInstructionController {

    private final PaymentInstructionService paymentInstructionService;

    @GetMapping
    public ResponseEntity<PaymentInstructionResponse> getPaymentInstructions() {
        return ResponseEntity.ok(paymentInstructionService.getPaymentInstructions());
    }
}
