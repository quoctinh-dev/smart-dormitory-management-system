package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import com.sdms.backend.modules.payment.service.PaymentInstructionService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sdms.backend.common.response.ApiResponse;

@RestController
@RequestMapping("/api/v1/public/payment-instructions")
@RequiredArgsConstructor
@Tag(name = "Hướng dẫn thanh toán (Payment Instruction)")
public class PaymentInstructionController {

    private final PaymentInstructionService paymentInstructionService;

    @Operation(summary = "Lấy hướng dẫn thanh toán")
    @GetMapping
    public ApiResponse<PaymentInstructionResponse> getPaymentInstructions() {
        return ApiResponse.success("Thành công", paymentInstructionService.getPaymentInstructions());
    }
}
