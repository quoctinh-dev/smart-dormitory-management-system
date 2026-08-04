package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.response.PaymentInstructionResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentInstructionService {

    private static final String SEPAY_QR_BASE_URL = "https://qr.sepay.vn/img";
    private static final String DEFAULT_CONTENT_PREFIX = "SDMS";

    private final BillRepository billRepository;

    @Value("${payment.sepay.bank-account}")
    private String bankAccount;

    @Value("${payment.sepay.bank-code}")
    private String bankCode;

    @Value("${payment.sepay.bank-name}")
    private String bankName;

    @Value("${payment.sepay.account-holder}")
    private String accountHolder;

    /**
     * Lấy thông tin hướng dẫn thanh toán chung (Mã QR tĩnh không cố định số tiền)
     */
    public PaymentInstructionResponse getPaymentInstructions() {
        String qrCodeUrl = buildQrUrl(BigDecimal.ZERO, DEFAULT_CONTENT_PREFIX);

        return PaymentInstructionResponse.builder()
                .bankName(bankName)
                .bankAccount(bankAccount)
                .accountHolder(accountHolder)
                .qrCodeUrl(qrCodeUrl)
                .content(DEFAULT_CONTENT_PREFIX)
                .build();
    }

    /**
     * Lấy thông tin hướng dẫn thanh toán cho một hóa đơn cụ thể (Mã QR động theo số tiền còn lại)
     */
    public PaymentInstructionResponse getPaymentInstructionsForBill(UUID billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn"));

        BigDecimal remainingAmount = bill.getAmount().subtract(bill.getPaidAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn này đã được thanh toán đầy đủ");
        }

        // Lấy 8 ký tự đầu của UUID làm mã hóa đơn (hoặc dùng bill.getCode() nếu có)
        String billCode = bill.getBillId().toString().substring(0, 8).toUpperCase();
        String transferContent = DEFAULT_CONTENT_PREFIX + billCode;

        String qrCodeUrl = buildQrUrl(remainingAmount, transferContent);

        return PaymentInstructionResponse.builder()
                .bankName(bankName)
                .bankAccount(bankAccount)
                .accountHolder(accountHolder)
                .qrCodeUrl(qrCodeUrl)
                .content(transferContent)
                .amount(remainingAmount) // Trả thêm số tiền cần trả nếu DTO hỗ trợ
                .build();
    }

    /**
     * Helper method tạo URL QR code SePay
     */
    private String buildQrUrl(BigDecimal amount, String description) {
        return UriComponentsBuilder.fromHttpUrl(SEPAY_QR_BASE_URL)
                .queryParam("acc", bankAccount)
                .queryParam("bank", bankCode)
                .queryParam("amount", amount.toPlainString())
                .queryParam("des", description)
                .build()
                .toUriString();
    }
}
