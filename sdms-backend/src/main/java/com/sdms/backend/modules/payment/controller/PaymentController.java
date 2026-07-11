package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.dto.request.CashPaymentRequest;
import com.sdms.backend.modules.payment.dto.request.OnlinePaymentRequest;
import com.sdms.backend.modules.payment.dto.response.PaymentResponse;
import com.sdms.backend.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * STUDENT thanh toán online.
     *
     * Ví dụ:
     * - VNPay
     * - MoMo
     * - Bank Transfer
     */
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/online")
    public ApiResponse<PaymentResponse> processOnlinePayment(
            @Valid @RequestBody OnlinePaymentRequest request
    ) {
        PaymentResponse response = paymentService.processOnlinePayment(
                request.getBillId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getTransactionCode()
        );

        return new ApiResponse<>(
                true,
                "Online payment successful",
                response
        );
    }

    /**
     * ADMIN xác nhận thanh toán tiền mặt.
     *
     * Flow:
     * Student pays cash
     *   ↓
     * Admin confirms
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/cash/approve")
    public ApiResponse<PaymentResponse> approveCashPayment(
            @Valid @RequestBody CashPaymentRequest request
    ) {
        PaymentResponse response = paymentService.approveCashPayment(
                request.getBillId(),
                request.getAmount()
        );

        return new ApiResponse<>(
                true,
                "Cash payment approved successfully",
                response
        );
    }

    /**
     * MOCK PAYMENT SUCCESS for testing event-driven flow.
     * This endpoint is for development/testing purposes only.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mock-success/{applicationId}")
    public ApiResponse<PaymentResponse> mockPaymentSuccess(@PathVariable UUID applicationId) {
        PaymentResponse response = paymentService.mockPaymentSuccess(applicationId);
        return new ApiResponse<>(
                true,
                "Mock payment successful, bill paid and event published.",
                response
        );
    }
}
