package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.request.SepayWebhookPayload;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class SepayService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${payment.sepay.api-key:default-api-key}")
    private String sepayApiKey;

    public void processWebhook(String rawPayload, String authorization) {
        // 1. Validate API Key
        if (authorization == null || !authorization.equals("Apikey " + sepayApiKey)) {
            log.warn("[SepayService] Invalid API Key");
            throw new AppException(ErrorCode.UNAUTHORIZED, "API Key không hợp lệ");
        }

        // 2. Parse Payload
        SepayWebhookPayload payload;
        try {
            payload = objectMapper.readValue(rawPayload, SepayWebhookPayload.class);
        } catch (Exception e) {
            log.error("[SepayService] Failed to parse webhook payload", e);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Định dạng payload không hợp lệ");
        }

        log.info("[SepayService] Processing webhook for gateway_transaction_id={}", payload.getId());

        // 1. Check duplicate gateway_transaction_id for replay protection
        Optional<Payment> existingPayment = paymentRepository.findByGatewayTransactionId(payload.getId());
        if (existingPayment.isPresent()) {
            log.warn("[SepayService] Webhook already processed for gateway_transaction_id={}", payload.getId());
            return; // Idempotent success
        }

        // 2. Validate transferType
        if (!"in".equalsIgnoreCase(payload.getTransferType())) {
            log.warn("[SepayService] Ignoring outgoing transfer: {}", payload.getId());
            return;
        }

        // 3. Extract transaction_code from content
        // Assuming format "SDMS-PAY-12345" is somewhere in the content
        String content = payload.getContent() != null ? payload.getContent() : "";
        String transactionCode = extractTransactionCode(content);
        
        if (transactionCode == null) {
            log.warn("[SepayService] Could not extract transaction_code from content: {}", content);
            return;
        }

        // 4. Find Pending Payment or Create from Bill
        Payment payment = null;
        Optional<Payment> optionalPayment = paymentRepository.findByTransactionCode(transactionCode);
        
        if (optionalPayment.isPresent()) {
            payment = optionalPayment.get();
        } else {
            // Fallback: If no Payment session found, try to find the Bill by prefix and create a Payment session
            if (transactionCode.startsWith("SDMS") && transactionCode.length() >= 12) {
                String billCodePrefix = transactionCode.substring(4, 12).toLowerCase(); // "SDMS0AE9F057" -> "0ae9f057"
                java.util.List<Bill> matchingBills = billRepository.findByBillIdPrefix(billCodePrefix);
                
                if (matchingBills.isEmpty()) {
                    log.warn("[SepayService] Transaction code {} does not match any Payment or Bill", transactionCode);
                    return;
                }
                
                if (matchingBills.size() > 1) {
                    log.warn("[SepayService] Multiple bills matched for prefix {}. Cannot process automatically.", billCodePrefix);
                    return;
                }
                
                Bill matchedBill = matchingBills.get(0);
                
                if (matchedBill.getStatus() == BillStatus.PAID) {
                    log.warn("[SepayService] Bill {} is already PAID.", matchedBill.getBillId());
                    return;
                }
                
                // Create a PENDING payment record on the fly
                payment = new Payment();
                payment.setBill(matchedBill);
                payment.setAmount(matchedBill.getAmount());
                payment.setMethod(com.sdms.backend.modules.payment.enums.PaymentMethod.BANK_TRANSFER);
                payment.setTransactionCode(transactionCode);
                payment.setStatus(PaymentStatus.PENDING);
                payment = paymentRepository.save(payment);
            } else {
                log.warn("[SepayService] Không tìm thấy giao dịch với mã: {}", transactionCode);
                return;
            }
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.warn("[SepayService] Payment {} is not PENDING (Status: {})", transactionCode, payment.getStatus());
            return;
        }

        // 5. Validate Amount
        if (payload.getTransferAmount().compareTo(payment.getAmount()) < 0) {
            log.warn("[SepayService] Transfer amount {} is less than required {}", payload.getTransferAmount(), payment.getAmount());
            paymentService.markPaymentFailed(payment.getPaymentId(), "Insufficient transfer amount from gateway");
            return;
        }

        // 6. Complete Payment
        payment.setGatewayTransactionId(payload.getId());
        paymentRepository.save(payment); // Save gateway ID first to ensure uniqueness
        
        paymentService.completeOnlinePayment(payment.getPaymentId(), payload.getTransferAmount());
    }



    private String extractTransactionCode(String content) {
        // Simple extraction: Look for words starting with SDMS
        String[] words = content.split("\\s+");
        for (String word : words) {
            if (word.startsWith("SDMS")) {
                return word;
            }
        }
        return null; // or null if not found
    }
}
