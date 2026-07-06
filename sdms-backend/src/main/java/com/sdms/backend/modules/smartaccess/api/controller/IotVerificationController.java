package com.sdms.backend.modules.smartaccess.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.application.service.AccessEvaluationService;
import com.sdms.backend.modules.smartaccess.application.service.EligibilityEvaluationService;
import com.sdms.backend.modules.face.service.FaceVerificationService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/smartaccess")
@RequiredArgsConstructor
public class IotVerificationController {

    private final ApplicationEventPublisher eventPublisher;
    private final AccessEvaluationService accessEvaluationService;
    private final FaceVerificationService faceVerificationService;
    private final EligibilityEvaluationService eligibilityEvaluationService;
    /**
     * Endpoint for IoT ESP32 to send RFID card verification requests.
     */
    @PostMapping("/verify/card")
    public ResponseEntity<Map<String, String>> verifyCard(@RequestBody Map<String, String> payload) {
        String rfidCode = payload.get("rfid");
        String gateIdStr = payload.get("gateId");

        log.info("[IoT] Received RFID verification request: rfid={}, gateId={}", rfidCode, gateIdStr);

        // Validate RFID code exists and belongs to an ACTIVE student
        var eligibilityOpt = eligibilityEvaluationService.evaluateEligibilityByRfid(rfidCode);
        if (eligibilityOpt.isEmpty()) {
            log.warn("[IoT] RFID verification failed for card: {}. Not found or inactive.", rfidCode);
            return ResponseEntity.ok(Map.of(
                    "status", "DENIED",
                    "message", "Card not recognized or inactive"
            ));
        }

        UUID studentId = eligibilityOpt.get().getStudentId();
        UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();

        eventPublisher.publishEvent(new IdentityVerifiedEvent(
                eventId,
                studentId,
                gateId,
                VerificationMethod.RFID
        ));

        return ResponseEntity.ok(Map.of(
                "status", "PROCESSING",
                "message", "Verification request received and event dispatched",
                "eventId", eventId
        ));
    }

    /**
     * Endpoint for IoT ESP32 to download the RFID whitelist for offline fallback mode.
     */
    @GetMapping("/rfid-whitelist")
    public ResponseEntity<Map<String, Object>> getRfidWhitelist() {
        log.info("[IoT] Fetching RFID Whitelist for offline mode sync");
        java.util.List<String> rfids = eligibilityEvaluationService.getActiveRfidWhitelists();
        
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "count", rfids.size(),
            "data", rfids
        ));
    }

    /**
     * Endpoint for IoT ESP32 to send Face Image verification requests.
     * Synchronous processing: Wait for AI response and access policy evaluation.
     */
    @PostMapping("/verify/face")
    public ResponseEntity<Map<String, Object>> verifyFace(
            @RequestParam("file") MultipartFile file,
            @RequestParam("gateId") String gateIdStr) {
            
        log.info("[IoT] Received Face verification request from ESP32: gateId={}", gateIdStr);

        try {
            // 1. Delegate to Face Module for vector extraction and DB matching
            var result = faceVerificationService.verifyFace(gateIdStr, file);
            
            if (result.isMatch()) {
                // 2. Face matched! Now evaluate curfew and time window policies synchronously
                UUID gateId = gateIdStr != null ? UUID.fromString(gateIdStr) : UUID.randomUUID();
                AccessDecision decision = accessEvaluationService.evaluateAccessSync(result.matchedProfileId(), gateId, VerificationMethod.FACE_AI);
                
                // 3. Return immediate result to ESP32 to trigger Relay
                if (decision == AccessDecision.GRANTED) {
                    return ResponseEntity.ok(Map.of(
                        "status", "GRANTED",
                        "message", "Face match and policy allowed",
                        "profileId", result.matchedProfileId(),
                        "confidence", result.confidenceScore()
                    ));
                } else {
                    return ResponseEntity.ok(Map.of(
                        "status", "DENIED",
                        "message", "Face matched but access denied by policy"
                    ));
                }
            } else {
                return ResponseEntity.ok(Map.of(
                    "status", "DENIED",
                    "message", "Face not recognized"
                ));
            }
        } catch (Exception e) {
            log.error("[IoT] Exception during face verification: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "status", "ERROR",
                "message", "AI Engine Down or Internal Error"
            ));
        }
    }
}
