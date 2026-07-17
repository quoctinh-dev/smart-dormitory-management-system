package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.common.response.ApiResponse;
import com.sdms.backend.modules.payment.dto.request.CashPaymentRequest;
import com.sdms.backend.modules.payment.dto.request.OnlinePaymentRequest;
import com.sdms.backend.modules.payment.dto.response.PaymentResponse;
import com.sdms.backend.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Thanh toán (Payment)", description = "Quản lý thanh toán hóa đơn")
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
    @Operation(summary = "Sinh viên thanh toán online (VNPay, MoMo, Bank Transfer)")
    // @PreAuthorize("hasRole('STUDENT')") // Bỏ chặn vì người dùng mới đăng ký chưa có tài khoản
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

        return ApiResponse.success(
                "Thanh toán online thành công",
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
    @Operation(summary = "Admin xác nhận thanh toán tiền mặt")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/cash/approve")
    public ApiResponse<PaymentResponse> approveCashPayment(
            @Valid @RequestBody CashPaymentRequest request
    ) {
        PaymentResponse response = paymentService.approveCashPayment(
                request.getBillId(),
                request.getAmount()
        );

        return ApiResponse.success(
                "Xác nhận thanh toán tiền mặt thành công",
                response
        );
    }

    /**
     * MOCK PAYMENT SUCCESS for testing event-driven flow.
     * This endpoint is for development/testing purposes only.
     */
    @Operation(summary = "Mock thanh toán thành công (Chỉ dùng cho testing)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/mock-success/{applicationId}")
    public ApiResponse<PaymentResponse> mockPaymentSuccess(@PathVariable UUID applicationId) {
        PaymentResponse response = paymentService.mockPaymentSuccess(applicationId);
        return ApiResponse.success(
                "Mock thanh toán thành công, hóa đơn đã được thanh toán và sự kiện đã được phát ra.",
                response
        );
    }
}
