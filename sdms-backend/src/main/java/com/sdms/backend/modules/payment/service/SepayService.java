package com.sdms.backend.modules.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.request.SepayWebhookPayload;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.PaymentMethod;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${payment.sepay.api-key}")
    private String sepayApiKey;

    /**
     * Xử lý Webhook tự động từ cổng thanh toán SePay.
     */
    public void processWebhook(String rawPayload, String authorization) {
        // 1. Kiểm tra API Key (Xác thực Request)
        if (authorization == null || !authorization.equals("Apikey " + sepayApiKey)) {
            log.warn("[SepayService] Invalid API Key");
            throw new AppException(ErrorCode.UNAUTHORIZED, "API Key không hợp lệ");
        }

        // 2. Chuyển đổi dữ liệu Payload từ JSON sang Object
        SepayWebhookPayload payload;
        try {
            payload = objectMapper.readValue(rawPayload, SepayWebhookPayload.class);
        } catch (Exception e) {
            log.error("[SepayService] Failed to parse webhook payload", e);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Định dạng payload không hợp lệ");
        }

        log.info("[SepayService] Processing webhook for gateway_transaction_id={}", payload.getId());

        // 3. Kiểm tra trùng lặp gateway_transaction_id (Tránh nhận 1 webhook nhiều lần - Idempotent)
        Optional<Payment> existingPayment = paymentRepository.findByGatewayTransactionId(payload.getId());
        if (existingPayment.isPresent()) {
            log.warn("[SepayService] Webhook already processed for gateway_transaction_id={}", payload.getId());
            return;
        }

        // 4. Kiểm tra loại giao dịch (Chỉ xử lý tiền vào: "in")
        if (!"in".equalsIgnoreCase(payload.getTransferType())) {
            log.warn("[SepayService] Ignoring outgoing transfer: {}", payload.getId());
            return;
        }

        // 5. Trích xuất mã giao dịch (Transaction Code) từ nội dung chuyển khoản
        String content = payload.getContent() != null ? payload.getContent() : "";
        String transactionCode = extractTransactionCode(content);

        if (transactionCode == null) {
            log.warn("[SepayService] Could not extract transaction_code from content: {}", content);
            return;
        }

        // 6. Tìm bản ghi Payment tương ứng hoặc tự động tạo mới từ Bill
        Payment payment = resolveOrCreatePayment(transactionCode);
        if (payment == null) {
            return;
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.warn("[SepayService] Payment {} is not PENDING (Status: {})", transactionCode, payment.getStatus());
            return;
        }

        // 7. Cập nhật mã giao dịch cổng thanh toán và số tiền thực tế
        payment.setGatewayTransactionId(payload.getId());
        payment.setAmount(payload.getTransferAmount());
        paymentRepository.save(payment); // Lưu ID SePay trước để tránh race condition

        paymentService.completeOnlinePayment(payment.getPaymentId(), payload.getTransferAmount());
    }

    /**
     * Tìm kiếm Payment session hoặc fallback tạo mới từ tiền tố mã Hóa đơn (Bill ID prefix).
     */
    private Payment resolveOrCreatePayment(String transactionCode) {
        Optional<Payment> optionalPayment = paymentRepository.findByTransactionCode(transactionCode);
        if (optionalPayment.isPresent()) {
            return optionalPayment.get();
        }

        // Fallback: Nếu không tìm thấy session Payment, tự tìm Bill dựa trên prefix
        if (transactionCode.startsWith("SDMS") && transactionCode.length() >= 12) {
            String billCodePrefix = transactionCode.substring(4, 12).toLowerCase(); // Ví dụ: "SDMS0AE9F057" -> "0ae9f057"
            List<Bill> matchingBills = billRepository.findByBillIdPrefix(billCodePrefix);

            if (matchingBills.isEmpty()) {
                log.warn("[SepayService] Transaction code {} does not match any Payment or Bill", transactionCode);
                return null;
            }

            if (matchingBills.size() > 1) {
                log.warn("[SepayService] Multiple bills matched for prefix {}. Cannot process automatically.", billCodePrefix);
                return null;
            }

            Bill matchedBill = matchingBills.get(0);
            if (matchedBill.getStatus() == BillStatus.PAID) {
                log.warn("[SepayService] Bill {} is already PAID.", matchedBill.getBillId());
                return null;
            }

            // Tạo nhanh bản ghi PENDING Payment
            Payment payment = new Payment();
            payment.setBill(matchedBill);
            payment.setAmount(matchedBill.getAmount());
            payment.setMethod(PaymentMethod.BANK_TRANSFER);
            payment.setTransactionCode(transactionCode);
            payment.setStatus(PaymentStatus.PENDING);
            return paymentRepository.save(payment);
        } else {
            log.warn("[SepayService] Không tìm thấy giao dịch với mã: {}", transactionCode);
            return null;
        }
    }

    /**
     * Trích xuất mã giao dịch (Bắt đầu bằng SDMS và theo sau là 8 ký tự Hex) từ nội dung chuyển khoản.
     * Hỗ trợ tìm kiếm xuyên suốt kể cả khi bị dính liền với dấu gạch ngang (Momo) hoặc các ký tự khác.
     */
    private String extractTransactionCode(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }
        
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("SDMS[A-Za-z0-9]{8}");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        
        if (matcher.find()) {
            return matcher.group(); // Trả về ví dụ: "SDMS71C570CD"
        }
        
        return null;
    }
}