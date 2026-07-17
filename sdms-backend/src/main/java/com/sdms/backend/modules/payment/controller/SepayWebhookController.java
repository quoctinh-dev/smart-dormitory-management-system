package com.sdms.backend.modules.payment.controller;

import com.sdms.backend.modules.payment.dto.request.SepayWebhookPayload;
import com.sdms.backend.modules.payment.service.SepayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/sepay")
@RequiredArgsConstructor
@Tag(name = "Webhook SePay (Auto-banking)", description = "Webhook nhận dữ liệu từ SePay")
public class SepayWebhookController {

    private final SepayService sepayService;

    @Operation(summary = "Nhận webhook từ SePay")
    @PostMapping
    public ResponseEntity<Map<String, Boolean>> handleWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody String rawPayload) {
        
        log.info("[SepayWebhookController] Received webhook");

        try {
            sepayService.processWebhook(rawPayload, authorization);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("[SepayWebhookController] Error processing webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false));
        }
    }
}
