package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.payment.dto.request.SepayWebhookPayload;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
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
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${payment.sepay.api-key:default-api-key}")
    private String sepayApiKey;

    @Value("${payment.sepay.secret-key:default-secret-key}")
    private String sepaySecretKey;

    public void processWebhook(String rawPayload, String authorization, String signature) {
        // 1. Validate API Key
        if (authorization == null || !authorization.equals("Apikey " + sepayApiKey)) {
            log.warn("[SepayService] Invalid API Key");
            throw new AppException("Invalid API Key", HttpStatus.UNAUTHORIZED);
        }

        // 2. Validate Signature
        if (signature == null || !verifySignature(rawPayload, signature)) {
            log.warn("[SepayService] Invalid Webhook Signature");
            throw new AppException("Invalid Webhook Signature", HttpStatus.UNAUTHORIZED);
        }

        // 3. Parse Payload
        SepayWebhookPayload payload;
        try {
            payload = objectMapper.readValue(rawPayload, SepayWebhookPayload.class);
        } catch (Exception e) {
            log.error("[SepayService] Failed to parse webhook payload", e);
            throw new AppException("Invalid payload format", HttpStatus.BAD_REQUEST);
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

        // 4. Find Pending Payment
        Payment payment = paymentRepository.findByTransactionCode(transactionCode)
                .orElseThrow(() -> new AppException("Payment not found for code: " + transactionCode, HttpStatus.NOT_FOUND));

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
        
        // Execute the payment completion via PaymentService
        // Wait, executePayment takes billId, amount, method, txnCode. But we already have the Payment entity.
        // We should probably add a completePayment method or reuse logic.
        // Since executePayment creates a new payment, we need a completeOnlinePayment method in PaymentService.
        paymentService.completeOnlinePayment(payment.getPaymentId(), payload.getTransferAmount());
    }

    private boolean verifySignature(String rawPayload, String providedSignature) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(sepaySecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hashBytes = sha256_HMAC.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            String computedSignature = sb.toString();
            return computedSignature.equalsIgnoreCase(providedSignature);
        } catch (Exception e) {
            log.error("Error computing HMAC SHA256", e);
            return false;
        }
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
